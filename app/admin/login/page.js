'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '../../../services/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    try {
      // 1. Try real backend login first
      const response = await AuthService.loginAdmin(cleanUsername, cleanPassword);

      if (!response?.access || response.role !== 'ADMIN') {
        setErrorMsg('This account does not have admin access.');
        setIsLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('imp_remember_admin_username', cleanUsername);
        } else {
          localStorage.removeItem('imp_remember_admin_username');
        }
      }

      router.push('/admin');
    } catch (err) {
      // 2. Dev Mock Fallback: allows frontend UI development without blocking
      if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
        const mockAdminUser = {
          uuid: 'dev-admin-uuid-001',
          username: 'admin',
          full_name: 'Marcus Brody',
          email: 'admin@postdesk.io',
          role: 'ADMIN',
          is_staff: true,
          is_superuser: true,
        };

        localStorage.setItem('imp_admin_token', 'dev_mock_admin_token_2026');
        localStorage.setItem('imp_access_token', 'dev_mock_admin_token_2026');
        localStorage.setItem('token', 'dev_mock_admin_token_2026');
        localStorage.setItem('imp_admin_user', JSON.stringify(mockAdminUser));
        localStorage.setItem('imp_user', JSON.stringify(mockAdminUser));
        localStorage.setItem('user', JSON.stringify(mockAdminUser));

        document.cookie = 'imp_admin_token=dev_mock_admin_token_2026; path=/; max-age=86400';
        document.cookie = 'token=dev_mock_admin_token_2026; path=/; max-age=86400';

        router.push('/admin');
        return;
      }

      if (err?.error) {
        setErrorMsg(err.error);
      } else if (err?.detail) {
        setErrorMsg(err.detail);
      } else {
        setErrorMsg('Login failed. For dev mode use admin / admin123');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#07050E] flex flex-col justify-between items-center px-4 py-6 sm:p-8 font-sans relative overflow-x-hidden select-none">
      
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] rounded-full blur-[130px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      <div className="w-full h-1" />

      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-[#120D22]/95 border border-[#231A3D] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl relative z-10 space-y-5 backdrop-blur-xl my-auto">
        
        <div className="text-center space-y-2.5">
          <div 
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#762CFF]/40 border border-white/10 ring-1 ring-white/20"
            style={{ background: 'linear-gradient(135deg, #B13CFF 0%, #762CFF 100%)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase">ADMIN PORTAL LOGIN</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">PostDesk Influencer Management</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl animate-in fade-in flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider block pl-1">
              EMAIL / USERNAME
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your admin email or username"
                className="w-full bg-[#18112E] border border-[#2B1F4A] focus:border-[#B13CFF] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider block pl-1">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#18112E] border border-[#2B1F4A] focus:border-[#B13CFF] rounded-xl px-3.5 py-2.5 sm:py-3 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5 px-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#2B1F4A] bg-[#18112E] text-[#B13CFF] focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-[#B13CFF]"
              />
              <span className="text-[11px] font-medium">Remember me</span>
            </label>
            <span className="text-slate-500 text-[10px]">Dev: admin / admin123</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-[#762CFF]/30 hover:shadow-[#B13CFF]/50 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <span>LOG IN TO CMS</span>
            )}
          </button>
        </form>

        <div className="text-center pt-1">
          <Link 
            href="/" 
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>←</span> Back to Influencer App
          </Link>
        </div>

      </div>

      <footer className="text-center pt-4 pb-2 relative z-10">
        <p className="text-[10px] font-black tracking-widest text-slate-300 uppercase">POSTDESK CMS</p>
        <p className="text-[9px] text-slate-500 mt-0.5">© 2026 • All rights reserved</p>
      </footer>

    </div>
  );
}