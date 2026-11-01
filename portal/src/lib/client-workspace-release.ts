import { publicCustomerTransactionsAuthorized } from "./public-release-status";

/**
 * Client workspaces and their staff counterpart must NOT activate from a
 * NEXT_PUBLIC variable alone. This is a fail-closed UI/transport switch,
 * not a replacement for API authorization, role verification or RLS.
 */
export function clientWorkspaceReleased(clientFlag: boolean): boolean {
  return publicCustomerTransactionsAuthorized === true && clientFlag === true;
}
