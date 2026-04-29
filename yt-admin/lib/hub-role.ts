export type HubRole = "admin" | "owner";

export function parseHubRole(raw: string | undefined): HubRole | null {
  if (raw === "admin" || raw === "owner") return raw;
  return null;
}
