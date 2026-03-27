/** Extrai payload do JWT (parte central). */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const ROLE_CLAIM_KEYS = [
  'role',
  'Role',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
] as const;

export function extractRoleFromPayload(payload: Record<string, unknown>): string | null {
  for (const key of ROLE_CLAIM_KEYS) {
    const v = payload[key];
    if (typeof v === 'string') {
      return v;
    }
    if (Array.isArray(v) && typeof v[0] === 'string') {
      return v[0];
    }
  }
  return null;
}
