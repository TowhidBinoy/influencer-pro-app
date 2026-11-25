'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import NotificationBell from '../../components/NotificationBell';
import GuideHelp from '../../components/GuideHelp';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';

function formatError(err) {
  if (err?.error) return err.error;
  if (err?.detail) return err.detail;
  if (err?.details && typeof err.details === 'string') return err.details;
  if (err?.details && typeof err.details === 'object') {
    const firstKey = Object.keys(err.details)[0];
    const val = err.details[firstKey];
    return Array.isArray(val) ? val[0] : val;
  }
  return 'Something went wrong. Please try again.';
}

export default function ProfilePage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Save Info Feedback
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    if (!token) {
      router.push('/');
      return;
    }

    async function loadProfile() {
      setIsLoading(true);
      setLoadError('');
      try {
        const profile = await apiFetch(ENDPOINTS.MEMBER.PROFILE);
        setDisplayName(profile.full_name || profile.username || '');
        setUsername(profile.username || '');
        setEmail(profile.email || '');
        setProfilePic(profile.profile_picture || null);
      } catch (err) {
        setLoadError(formatError(err));
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // Handle Profile Picture Upload
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  // Handle Profile Details Save — full_name / profile_picture only (email
  // and username aren't editable per doc/API.md §25).
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setLoadError('');

    try {
      let body;
      let headers;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('full_name', displayName);
        formData.append('profile_picture', avatarFile);
        body = formData;
      } else {
        body = JSON.stringify({ full_name: displayName });
        headers = { 'Content-Type': 'application/json' };
      }

      const updated = await apiFetch(ENDPOINTS.MEMBER.PROFILE, { method: 'PATCH', body, headers });
      setDisplayName(updated.full_name || updated.username || '');
      setProfilePic(updated.profile_picture || null);
      setAvatarFile(null);

      const cachedUserStr = localStorage.getItem('imp_user');
      if (cachedUserStr) {
        try {
          const parsedUser = JSON.parse(cachedUserStr);
          localStorage.setItem('imp_user', JSON.stringify({ ...parsedUser, full_name: updated.full_name }));
        } catch {}
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change — /members/profile/change-password/
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    setIsUpdatingPass(true);

    try {
      await apiFetch(ENDPOINTS.MEMBER.CHANGE_PASSWORD, {
        method: 'PATCH',
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      setPassMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMessage({ type: 'error', text: formatError(err) });
    } finally {
      setIsUpdatingPass(false);
      setTimeout(() => setPassMessage({ type: '', text: '' }), 4000);
    }
  };

  const displayInitial = (displayName || username || 'E').charAt(0).toUpperCase();

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">

      {/* Background Glow Effect */}
      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      {/* 1. TRANSPARENT TOP APP HEADER */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-[#762CFF]/30"
            style={{ background: 'linear-gradient(135deg, #B13CFF 0%, #762CFF 100%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-wider text-white">INFLUENCER PRO</span>
        </div>

        <NotificationBell />
      </header>

      {/* 2. SCROLLABLE INNER CONTENT */}
      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        {/* Header & Back Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase">MY PROFILE</h1>
        </div>

        <GuideHelp location={9} label="Tips for your profile" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading profile...</p>
        ) : (
          <>
            {/* Section 1: Profile Picture & Display Info */}
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md text-center relative">
              <div className="relative w-20 h-20 mx-auto mb-3">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-[#B13CFF]" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#1A1230] border-2 border-[#8B31FF] flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                    {displayInitial}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#8B31FF] hover:bg-[#B13CFF] rounded-full flex items-center justify-center cursor-pointer border-2 border-[#07050E] transition-all shadow-md">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <span className="text-white text-xs">📷</span>
                </label>
              </div>

              <h2 className="text-base font-bold text-white capitalize">{displayName || username}</h2>
              <p className="text-xs text-[#B13CFF] font-medium mt-0.5">@{username}</p>
            </div>

            {/* Section 2: Edit Account Details Form */}
            <form onSubmit={handleSaveProfile} className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3">
              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">PROFILE INFORMATION</p>

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">Username (Read-only)</label>
                <input
                  type="text"
                  disabled
                  value={`@${username}`}
                  className="w-full bg-[#0E091D]/60 border border-[#231A3D] text-slate-500 rounded-xl px-3.5 py-2.5 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={email || '—'}
                  className="w-full bg-[#0E091D]/60 border border-[#231A3D] text-slate-500 rounded-xl px-3.5 py-2.5 text-xs cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all uppercase cursor-pointer mt-1 disabled:opacity-70 flex items-center justify-center gap-1.5"
              >
                {isSavingProfile ? (
                  <span>Saving...</span>
                ) : isSaved ? (
                  <span>✓ Profile Saved!</span>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </form>

            {/* Section 3: Change Password Card */}
            <form onSubmit={handleChangePassword} className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3">
              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">CHANGE PASSWORD</p>

              {passMessage.text && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                    : 'bg-[#FF2A55]/20 border border-[#FF2A55]/40 text-[#FF2A55]'
                }`}>
                  {passMessage.text}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPass}
                className="w-full py-2.5 bg-[#1C1438] hover:bg-[#2B1F4A] border border-[#762CFF]/50 text-white rounded-xl text-xs font-bold transition-all uppercase cursor-pointer disabled:opacity-70 flex items-center justify-center gap-1.5"
              >
                {isUpdatingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            {/* Section 4: Quick Link to Bank Details */}
            <Link
              href="/more/bank-details"
              className="bg-[#120D22] border border-[#231A3D] hover:border-[#10B981] rounded-[20px] p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group block"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1A1230] border border-[#2B1F4A] flex items-center justify-center text-[#10B981]">
                  💳
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#10B981] transition-colors">Bank Details</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage payout accounts</p>
                </div>
              </div>
              <span className="text-slate-400 text-sm group-hover:text-white transition-colors">›</span>
            </Link>
          </>
        )}

      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR */}
      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
