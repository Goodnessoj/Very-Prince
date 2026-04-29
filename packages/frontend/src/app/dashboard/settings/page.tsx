"use client";

import { useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { WebhookSettings } from "@/components/WebhookSettings";
import { ApiKeySettings } from "@/components/ApiKeySettings";

/**
 * @file dashboard/settings/page.tsx
 * @description Dashboard settings page for API keys and webhooks.
 */
export default function DashboardSettingsPage() {
  const { publicKey } = useFreighter();
  const [activeTab, setActiveTab] = useState<"api-keys" | "webhooks">("api-keys");

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-white/60">
          Manage your API keys, webhooks, and other settings
        </p>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────────── */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("api-keys")}
          className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 ${
            activeTab === "api-keys"
              ? "border-stellar-purple text-white"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 ${
            activeTab === "webhooks"
              ? "border-stellar-purple text-white"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          Webhooks
        </button>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────────── */}
      <div className="mt-8">
        {!publicKey ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
            <p className="text-white/60">
              Connect your wallet to manage organization-specific settings.
            </p>
          </div>
        ) : (
          <>
            {activeTab === "api-keys" && (
              <div className="space-y-6">
                <ApiKeySettings orgId="" publicKey={publicKey} />
              </div>
            )}

            {activeTab === "webhooks" && (
              <div className="space-y-6">
                <WebhookSettings orgId="" publicKey={publicKey} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
