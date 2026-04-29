/**
 * @file index.ts
 * @description Shared TypeScript interfaces for the very-princess monorepo.
 *
 * Both `@very-princess/backend` and `@very-princess/frontend` import from here
 * to ensure a single source of truth for all Soroban-derived data shapes.
 */

// ── Stellar / Soroban primitives ──────────────────────────────────────────────

/** A Stellar public key (G…). */
export type StellarAddress = string;

/** A Soroban Symbol used as an organisation identifier. */
export type OrgId = string;

// ── Core domain types ─────────────────────────────────────────────────────────

/** Organisation as stored in the Soroban contract (DataKey::Organization). */
export interface Organization {
  id: OrgId;
  name: string;
  admins: StellarAddress[];
}

/** Maintainer record linking an address to its organisation. */
export interface Maintainer {
  address: StellarAddress;
  orgId: OrgId;
}

/** Claimable payout entry for a maintainer (DataKey::MaintainerBalance). */
export interface MaintainerPayout {
  amount: bigint;
  unlockTimestamp: number;
}

// ── API response shapes ───────────────────────────────────────────────────────

/** Organisation enriched with its on-chain budget, returned by the backend. */
export interface OrganizationWithBudget extends Organization {
  budgetStroops: string;
  budgetXlm: string;
}

/** Paginated list of organisations returned by GET /api/org. */
export interface PaginatedOrgsResponse {
  data: { id: string; name: string; admin: string; publicBudget?: string }[];
  meta: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
  };
}

// ── Event / analytics types ───────────────────────────────────────────────────

/** A single on-chain payout event emitted by `allocate_payout`. */
export interface PayoutEvent {
  orgId: OrgId;
  amountStroops: bigint;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
}

/** Aggregated payout statistics for a maintainer address. */
export interface ProfileStats {
  address: StellarAddress;
  totalStroops: bigint;
  totalXlm: string;
  orgIds: OrgId[];
  payouts: PayoutEvent[];
}

// ── Stellar SDK wrappers ──────────────────────────────────────────────────────

/** Basic Horizon account information. */
export interface AccountInfo {
  id: string;
  sequence: string;
  balances: Array<{
    balance: string;
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  }>;
}

/** Result of a Soroban contract call (read or write). */
export interface ContractCallResult {
  success: boolean;
  value: unknown;
  transactionHash?: string;
}

// ─── Error Codes ─────────────────────────────────────────────────────────────

/**
 * Custom error codes returned by the PayoutRegistry contract.
 * These correspond to the PrincessError enum in the Rust contract.
 */
export enum PrincessError {
  AlreadyInitialized = 1,
  EmptyAdminList = 2,
  InvalidThreshold = 3,
  ContractNotInitialized = 4,
  ProtocolPaused = 5,
  InsufficientMultisigAuth = 6,
  OrgAlreadyRegistered = 7,
  OrgNotFound = 8,
  NotAuthorized = 9,
  InvalidAmount = 10,
  BudgetOverflow = 11,
  InsufficientBudget = 12,
  MaxAdminLimitReached = 13,
  AdminAlreadyExists = 14,
  CannotRemoveLastAdmin = 15,
  NotAnAdmin = 16,
  MaintainerAlreadyRegistered = 17,
  MaintainerNotRegistered = 18,
  MaintainerOrgMismatch = 19,
  PayoutOverflow = 20,
  BatchSizeExceeded = 21,
  EmptyBatch = 22,
  NoClaimableBalance = 23,
  PayoutLocked = 24,
  NoPendingAdmin = 25,
  NotPendingAdmin = 26,
}

/**
 * Human-readable messages for PrincessError codes.
 */
export const PrincessErrorMessage: Record<PrincessError, string> = {
  [PrincessError.AlreadyInitialized]: "The contract is already initialized.",
  [PrincessError.EmptyAdminList]: "The admin list cannot be empty.",
  [PrincessError.InvalidThreshold]: "The multisig threshold is invalid.",
  [PrincessError.ContractNotInitialized]: "The contract has not been initialized yet.",
  [PrincessError.ProtocolPaused]: "The protocol is currently paused for maintenance.",
  [PrincessError.InsufficientMultisigAuth]: "Insufficient signatures provided for this multisig action.",
  [PrincessError.OrgAlreadyRegistered]: "This organization is already registered.",
  [PrincessError.OrgNotFound]: "Organization not found.",
  [PrincessError.NotAuthorized]: "You are not authorized to perform this action.",
  [PrincessError.InvalidAmount]: "The provided amount must be positive.",
  [PrincessError.BudgetOverflow]: "Organization budget overflow.",
  [PrincessError.InsufficientBudget]: "Insufficient organization budget.",
  [PrincessError.MaxAdminLimitReached]: "Maximum number of admins (10) reached.",
  [PrincessError.AdminAlreadyExists]: "This address is already an admin.",
  [PrincessError.CannotRemoveLastAdmin]: "Cannot remove the last administrator.",
  [PrincessError.NotAnAdmin]: "This address is not an administrator.",
  [PrincessError.MaintainerAlreadyRegistered]: "This maintainer is already registered.",
  [PrincessError.MaintainerNotRegistered]: "Maintainer not found in the registry.",
  [PrincessError.MaintainerOrgMismatch]: "Maintainer does not belong to this organization.",
  [PrincessError.PayoutOverflow]: "Payout amount overflow.",
  [PrincessError.BatchSizeExceeded]: "Batch size exceeds the limit of 100 entries.",
  [PrincessError.EmptyBatch]: "The batch payout list cannot be empty.",
  [PrincessError.NoClaimableBalance]: "You have no claimable balance at this time.",
  [PrincessError.PayoutLocked]: "This payout is still in its unlock period.",
  [PrincessError.NoPendingAdmin]: "No pending admin proposal found.",
  [PrincessError.NotPendingAdmin]: "You are not the proposed pending administrator.",
};
