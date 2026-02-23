const TOKEN_KEY = "watchlist_token";

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    if (typeof window === "undefined") return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = window.atob(padded);

    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUserDisplayName(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = parseJwtPayload(token);
    if (!payload) return null;

    const candidates = [
      payload.fullName,
      payload.name,
      payload.username,
      payload.email,
    ];

    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    return null;
  },

  getUserInitial(): string {
    const displayName = this.getUserDisplayName();
    if (!displayName) return "U";

    const firstChar =
      displayName.match(/[A-Za-z0-9]/)?.[0] ?? displayName.charAt(0);
    return firstChar.toUpperCase();
  },
};
