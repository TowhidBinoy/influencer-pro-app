import { apiFetch } from '../lib/api';
import { ENDPOINTS } from '../lib/endpoints';

/**
 * Member and admin sessions are stored under separate localStorage keys so
 * that logging into one role on a device doesn't overwrite the other's
 * session (they used to share the same imp_* keys, which meant whichever
 * role logged in last silently kicked out the other on that device).
 */
const MEMBER_KEYS = {
  access: 'imp_access_token',
  refresh: 'imp_refresh_token',
  user: 'imp_user',
};

const ADMIN_KEYS = {
  access: 'imp_admin_access_token',
  refresh: 'imp_admin_refresh_token',
  user: 'imp_admin_user',
};

const keysFor = (scope) => (scope === 'admin' ? ADMIN_KEYS : MEMBER_KEYS);

export const AuthService = {
  /**
   * Member / Influencer login endpoint
   * Path: /login/member-access-token/
   */
  loginMember: async (username, password, extraData = {}) => {
    const payload = {
      username,
      password,
      ip_address: extraData.ip_address || '',
      device: extraData.device || (typeof window !== 'undefined' ? navigator.userAgent : ''),
    };

    const res = await apiFetch(ENDPOINTS.AUTH.MEMBER_LOGIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.access) {
      localStorage.setItem(MEMBER_KEYS.access, res.access);
      localStorage.setItem(MEMBER_KEYS.refresh, res.refresh);
      localStorage.setItem(MEMBER_KEYS.user, JSON.stringify(res));
    }
    return res;
  },

  /**
   * Admin portal login endpoint
   * Path: /login/admin-access-token/
   */
  loginAdmin: async (username, password) => {
    const payload = {
      username,
      password,
    };

    const res = await apiFetch(ENDPOINTS.AUTH.ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.access) {
      localStorage.setItem(ADMIN_KEYS.access, res.access);
      localStorage.setItem(ADMIN_KEYS.refresh, res.refresh);
      localStorage.setItem(ADMIN_KEYS.user, JSON.stringify(res));
    }
    return res;
  },

  /**
   * Token refresh endpoint
   * Path: /login/refresh-token/
   */
  refreshToken: async (scope = 'member') => {
    const { access, refresh: refreshKey } = keysFor(scope);
    const refresh = typeof window !== 'undefined' ? localStorage.getItem(refreshKey) : null;
    if (!refresh) return null;

    const res = await apiFetch(ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });

    if (res.access) {
      localStorage.setItem(access, res.access);
      if (res.refresh) localStorage.setItem(refreshKey, res.refresh);
    }
    return res;
  },

  /**
   * Verify an access token is still valid
   * Path: /login/verify-token/
   */
  verifyToken: async (token) => {
    return apiFetch(ENDPOINTS.AUTH.VERIFY_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  /**
   * Logout and blacklist refresh token. Only clears the session for the
   * given scope, leaving any other-role session on the same device intact.
   */
  logout: async (redirectTo = '/login', scope = 'member') => {
    const { access, refresh: refreshKey, user } = keysFor(scope);
    const refresh = typeof window !== 'undefined' ? localStorage.getItem(refreshKey) : null;
    try {
      if (refresh) {
        await apiFetch(ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          body: JSON.stringify({ refresh }),
        });
      }
    } catch {
      // Proceed with local cleanup on error
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(access);
        localStorage.removeItem(refreshKey);
        localStorage.removeItem(user);
        window.location.href = redirectTo;
      }
    }
  },

  /**
   * Get current stored session user data
   */
  getCurrentUser: (scope = 'member') => {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem(keysFor(scope).user);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Current session's access token, or null if there isn't one
   */
  getAccessToken: (scope = 'member') => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(keysFor(scope).access);
  },
};
