'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  // Form State with predefined demo credentials
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status State
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername !== 'admin' || cleanPassword !== 'admin123') {
      setErrorMsg('Invalid demo credentials. Use Username: admin & Password: admin123');
      return;
    }

    setIsLoading(true);

    const mockUser = {
      uuid: 'dev-admin-uuid-001',
      username: 'admin',
      full_name: 'Towhid Rahman',
      email: 'admin@influencerpro.io',
      role: 'ADMIN',
      is_staff: true,
      is_superuser: true,
    };

    // Set both Member & Admin tokens so recruiters can explore ALL routes seamlessly
    localStorage.setItem('imp_access_token', 'dev_mock_jwt_token_2026');
    localStorage.setItem('imp_admin_access_token', 'dev_mock_jwt_token_2026');
    localStorage.setItem('imp_refresh_token', 'dev_mock_refresh_token_2026');
    localStorage.setItem('imp_token', 'dev_mock_jwt_token_2026');
    localStorage.setItem('access_token', 'dev_mock_jwt_token_2026');
    localStorage.setItem('token', 'dev_mock_jwt_token_2026');
    localStorage.setItem('imp_user', JSON.stringify(mockUser));
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Store in cookies for layout/route checks
    document.cookie = 'imp_access_token=dev_mock_jwt_token_2026; path=/; max-age=86400';
    document.cookie = 'token=dev_mock_jwt_token_2026; path=/; max-age=86400';
    document.cookie = 'access_token=dev_mock_jwt_token_2026; path=/; max-age=86400';

    if (rememberMe) {
      localStorage.setItem('imp_remember_username', 'admin');
    }

    setIsLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased p-5">
      <div
        className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full blur-[120px] opacity-45 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      <div className="z-10 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto scrollbar-hide py-2">
        <div className="text-center pt-2">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-[#762CFF]/40 border border-white/10 mb-3.5 group hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #B13CFF 0%, #762CFF 100%)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>

          <h1 className="text-xl font-black tracking-wider text-white uppercase">INFLUENCER PRO</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Creator & Campaign Management Suite</p>
        </div>

        <div className="bg-[#120D22]/90 border border-[#231A3D] rounded-[28px] p-5 shadow-2xl backdrop-blur-xl my-auto max-w-md w-full mx-auto">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-400 mt-1 font-normal leading-snug">
              Log in to explore the live interactive portfolio demo.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-3.5 p-3 rounded-xl bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold flex items-center gap-2">
              <span className="text-sm shrink-0">⚠️</span>
              <p className="leading-tight">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider mb-1.5">
                EMAIL / USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter your email or username"
                className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-[#0E091D] border-[#231A3D] text-[#8B31FF] accent-[#8B31FF] cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
              className="relative group overflow-hidden w-full text-white font-bold py-3.5 rounded-xl text-xs tracking-wider shadow-lg shadow-[#762CFF]/40 hover:shadow-[#B13CFF]/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AUTHENTICATING...</span>
                </div>
              ) : (
                <span className="relative z-10">LOG IN TO DEMO</span>
              )}
            </button>
          </form>

          {/* Portfolio Demo Notice */}
          <div className="mt-4 pt-3.5 border-t border-[#231A3D] text-center">
            <p className="text-[11px] text-slate-400">
              Demo Credentials Pre-filled: <span className="text-white font-mono font-semibold">admin</span> / <span className="text-white font-mono font-semibold">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}