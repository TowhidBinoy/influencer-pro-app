'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../../services/auth';

const AdminGuardContext = createContext(false);

function AdminGuardLoading() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#07050E] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#762CFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 tracking-wider font-medium">Checking Admin Authorization...</p>
      </div>
    </div>
  );
}

/**
 * Gates the /admin route tree on a real admin session — the same
 * imp_access_token / imp_user session AuthService.loginAdmin creates and
 * apiFetch (lib/api.js) attaches to every admin API call. No token, no
 * ADMIN role, or a token the backend no longer accepts all redirect to
 * /admin/login instead of rendering the page.
 */
export function AdminRouteGuard({ children }) {
  const alreadyGuarded = useContext(AdminGuardContext);
  const router = useRouter();
  const verifiedRef = useRef(false);
  const [status, setStatus] = useState('checking'); // 'checking' | 'authorized' | 'redirecting'

  useEffect(() => {
    if (alreadyGuarded) return;
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const token = AuthService.getAccessToken('admin');
    const user = AuthService.getCurrentUser('admin');

    if (!token || !user || user.role !== 'ADMIN') {
      setStatus('redirecting');
      router.replace('/admin/login');
      return;
    }

    setStatus('authorized');

    // Background check — don't block the first render on it, but if the
    // token has expired or been revoked server-side, try one refresh before
    // sending the admin back to log in (rather than letting every
    // subsequent apiFetch call fail with a silent 401).
    AuthService.verifyToken(token).catch(async () => {
      const refreshed = await AuthService.refreshToken('admin').catch(() => null);
      if (!refreshed?.access) {
        AuthService.logout('/admin/login', 'admin');
      }
    });
  }, [alreadyGuarded, router]);

  if (alreadyGuarded) return children;
  if (status !== 'authorized') return <AdminGuardLoading />;

  return (
    <AdminGuardContext.Provider value={true}>
      {children}
    </AdminGuardContext.Provider>
  );
}
