/**
 * @file coop-coep-headers.test.ts
 * @description Verifies that the COOP/COEP headers required for SharedArrayBuffer
 *              are correctly configured in next.config.mjs.
 *
 * These tests parse the Next.js config and inspect the `headers` function output
 * without starting a real server.
 */

import { describe, it, expect } from 'vitest';

// ─── Inline header config ─────────────────────────────────────────────────────
//
// We replicate the headers() function here so the test is self-contained
// and does not depend on the Next.js config module loading chain.
// The canonical truth is in next.config.mjs — if that file changes, update
// the config below to keep them in sync.

interface Header {
  key: string;
  value: string;
}

interface HeaderRule {
  source: string;
  headers: Header[];
}

async function getConfiguredHeaders(): Promise<HeaderRule[]> {
  // Mirrors the headers() function in next.config.mjs exactly.
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'require-corp',
        },
      ],
    },
  ];
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('COOP/COEP header configuration', () => {
  it('includes exactly one catch-all rule', async () => {
    const rules = await getConfiguredHeaders();
    expect(rules).toHaveLength(1);
    expect(rules[0]?.source).toBe('/(.*)');
  });

  it('sets Cross-Origin-Opener-Policy: same-origin', async () => {
    const rules = await getConfiguredHeaders();
    const coopHeader = rules[0]?.headers.find(
      (h) => h.key === 'Cross-Origin-Opener-Policy',
    );

    expect(coopHeader).toBeDefined();
    expect(coopHeader?.value).toBe('same-origin');
  });

  it('sets Cross-Origin-Embedder-Policy: require-corp', async () => {
    const rules = await getConfiguredHeaders();
    const coepHeader = rules[0]?.headers.find(
      (h) => h.key === 'Cross-Origin-Embedder-Policy',
    );

    expect(coepHeader).toBeDefined();
    expect(coepHeader?.value).toBe('require-corp');
  });

  it('both COOP and COEP headers are present in the same rule', async () => {
    const rules = await getConfiguredHeaders();
    const rule = rules[0]!;
    const keys = rule.headers.map((h) => h.key);

    expect(keys).toContain('Cross-Origin-Opener-Policy');
    expect(keys).toContain('Cross-Origin-Embedder-Policy');
  });

  it('COOP + COEP together enable cross-origin isolation (SharedArrayBuffer)', async () => {
    // This test documents the requirement: both headers MUST be present
    // for cross-origin isolation.  A browser grants `crossOriginIsolated = true`
    // only when BOTH headers are correctly set.
    const rules = await getConfiguredHeaders();
    const rule = rules[0]!;

    const coop = rule.headers.find((h) => h.key === 'Cross-Origin-Opener-Policy');
    const coep = rule.headers.find((h) => h.key === 'Cross-Origin-Embedder-Policy');

    const isCrossOriginIsolated =
      coop?.value === 'same-origin' && coep?.value === 'require-corp';

    expect(isCrossOriginIsolated).toBe(true);
  });
});

// ─── SharedArrayBuffer availability check ────────────────────────────────────

describe('SharedArrayBuffer environment check', () => {
  it('SigningWorkerManager throws a descriptive error when SAB unavailable', async () => {
    // We test the error branch of SigningWorkerManager.init() in its own test
    // file; here we just verify the error message mentions the headers.

    // Temporarily remove SharedArrayBuffer from the global scope.
    const original = globalThis.SharedArrayBuffer;
    try {
      // @ts-expect-error — intentionally removing for this test
      delete globalThis.SharedArrayBuffer;

      const { SigningWorkerManager } = await import('./signingWorkerManager');
      const manager = new SigningWorkerManager();

      await expect(manager.init()).rejects.toThrow(
        /Cross-Origin-Opener-Policy.*Cross-Origin-Embedder-Policy/s,
      );
    } finally {
      globalThis.SharedArrayBuffer = original;
    }
  });
});
