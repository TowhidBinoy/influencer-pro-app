'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  User, 
  Shield, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Lock, 
  LayoutDashboard, 
  Video, 
  Info,
  CheckCircle2
} from 'lucide-react';

function UserFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    userGroup: '',
    statusActive: true,
    role: 'KOC', // 'KOL' or 'KOC'
    modules: {
      dashboard: true,
      userManagement: false,
      frameManagement: false,
      videoManagement: true,
      auditLog: false,
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load mock data if editing
  useEffect(() => {
    if (editId) {
      setFormData((prev) => ({
        ...prev,
        fullName: 'Eliska Jones',
        email: 'eliska@koc.com',
        username: 'eliskajones',
        userGroup: 'group_alpha',
        statusActive: true,
        role: 'KOC',
        password: 'password123',
        confirmPassword: 'password123',
      }));
    }
  }, [editId]);

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      modules: selectedRole === 'KOC' 
        ? { dashboard: true, userManagement: false, frameManagement: false, videoManagement: true, auditLog: false }
        : { dashboard: true, userManagement: true, frameManagement: true, videoManagement: true, auditLog: true }
    }));
  };

  const handleToggleModule = (moduleKey) => {
    setFormData((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleKey]: !prev.modules[moduleKey]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/admin/users');
    }, 600);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header with Breadcrumb */}
      <div className="space-y-1">
        <div className="text-[11px] text-slate-500 font-medium tracking-wide">
          <span>Frame Management</span>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-300">{editId ? 'Edit User' : 'Add User'}</span>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <Link
            href="/admin/users"
            className="p-1 -ml-1 text-white hover:text-[#8B31FF] transition-colors rounded-lg flex items-center gap-1.5 group cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {editId ? 'Edit User' : 'Add User'}
            </h1>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* 2. Main Full Width Two Column Form Grid (12 Cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
          
          {/* Left Column: User Information (7 Cols) */}
          <div className="xl:col-span-7 bg-[#110D20] border border-[#211A35] hover:border-[#2F244C] transition-all rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1E1730] pb-4">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">User Information</h2>
              <div className="w-8 h-8 rounded-xl bg-[#1A1230] border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eliska Jones"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner hover:border-[#352857]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. eliska@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner hover:border-[#352857]"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  USERNAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. eliskajones"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner hover:border-[#352857]"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner hover:border-[#352857]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner hover:border-[#352857]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* User Group */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  USER GROUP
                </label>
                <select
                  value={formData.userGroup}
                  onChange={(e) => setFormData({ ...formData, userGroup: e.target.value })}
                  className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none transition-all cursor-pointer hover:border-[#352857]"
                >
                  <option value="">Select assigned user group</option>
                  <option value="group_alpha">Group Alpha</option>
                  <option value="group_beta">Group Beta</option>
                  <option value="group_delta">Team Delta</option>
                </select>
              </div>

              {/* Status Toggle Switch */}
              <div className="pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  STATUS
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, statusActive: !formData.statusActive })}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner ${
                      formData.statusActive ? 'bg-[#8B31FF]' : 'bg-[#251B3D]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        formData.statusActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-semibold tracking-wide transition-colors ${
                    formData.statusActive ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {formData.statusActive ? 'Active (Access Enabled)' : 'Inactive (Access Disabled)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Role Assignment & Module Access (5 Cols) */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* Role Assignment Card */}
            <div className="bg-[#110D20] border border-[#211A35] hover:border-[#2F244C] transition-all rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1E1730] pb-4">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">Role Assignment</h2>
                <div className="w-8 h-8 rounded-xl bg-[#1A1230] border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
                  <Shield className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                {/* Option 1: KOL */}
                <div
                  onClick={() => handleRoleSelect('KOL')}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                    formData.role === 'KOL'
                      ? 'bg-[#18112C] border-[#8B31FF] shadow-lg shadow-purple-900/30'
                      : 'bg-[#150F26] border-[#241B3D] hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">KOL (IMP)</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-900/40 text-purple-300 border border-purple-500/30">
                          Influencer Portal
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        Access to assigned KOL modules only. Managing campaigns, tasks, and influencers.
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      formData.role === 'KOL' ? 'border-[#8B31FF] bg-[#8B31FF]' : 'border-slate-600 bg-transparent'
                    }`}>
                      {formData.role === 'KOL' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Option 2: KOC (Default Selected) */}
                <div
                  onClick={() => handleRoleSelect('KOC')}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                    formData.role === 'KOC'
                      ? 'bg-[#18112C] border-[#8B31FF] shadow-lg shadow-purple-900/30'
                      : 'bg-[#150F26] border-[#241B3D] hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">KOC (PostDesk)</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00B4D8]/20 text-[#00D2FF] border border-[#00B4D8]/30">
                          Default Selected
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        Access to assigned KOC modules only. Video processing, frame templates, and reel submissions.
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      formData.role === 'KOC' ? 'border-[#8B31FF] bg-[#8B31FF]' : 'border-slate-600 bg-transparent'
                    }`}>
                      {formData.role === 'KOC' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module Access Card */}
            <div className="bg-[#110D20] border border-[#211A35] hover:border-[#2F244C] transition-all rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Module Access
              </h2>

              <div className="space-y-3">
                {/* 1. Dashboard */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#16102B] border border-[#241B3D] hover:border-[#352758] transition-colors">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-white">Dashboard</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleModule('dashboard')}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      formData.modules.dashboard ? 'bg-[#8B31FF]' : 'bg-[#2A2045]'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                      formData.modules.dashboard ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. User Management (Locked) */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#140E26]/80 border border-[#201738] opacity-60">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400">User Management</span>
                  </div>
                  <div className="w-10 h-5 flex items-center rounded-full p-0.5 bg-[#22173B] cursor-not-allowed">
                    <div className="bg-slate-500 w-4 h-4 rounded-full shadow" />
                  </div>
                </div>

                {/* 3. Frame Management (Locked) */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#140E26]/80 border border-[#201738] opacity-60">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400">Frame Management</span>
                  </div>
                  <div className="w-10 h-5 flex items-center rounded-full p-0.5 bg-[#22173B] cursor-not-allowed">
                    <div className="bg-slate-500 w-4 h-4 rounded-full shadow" />
                  </div>
                </div>

                {/* 4. Video Management */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#16102B] border border-[#241B3D] hover:border-[#352758] transition-colors">
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-white">Video Management</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleModule('videoManagement')}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      formData.modules.videoManagement ? 'bg-[#8B31FF]' : 'bg-[#2A2045]'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                      formData.modules.videoManagement ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 5. Audit Log (Locked) */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#140E26]/80 border border-[#201738] opacity-60">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400">Audit Log</span>
                  </div>
                  <div className="w-10 h-5 flex items-center rounded-full p-0.5 bg-[#22173B] cursor-not-allowed">
                    <div className="bg-slate-500 w-4 h-4 rounded-full shadow" />
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="p-3.5 bg-[#150F26] border border-[#261E3E] rounded-xl flex items-start gap-3 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Restricted modules will not be visible or accessible to this user&apos;s PostDesk interface.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. Bottom Actions Bar (Full Width Flush) */}
        <div className="flex items-center justify-between pt-6 border-t border-[#1F1833]">
          <Link
            href="/admin/users"
            className="px-7 py-3 rounded-xl border border-[#2B1F4A] hover:bg-[#18112E] hover:border-[#3D2C68] text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{editId ? 'Update User' : 'Create User'}</span>
          </button>
        </div>
      </form>

    </div>
  );
}

export default function AddUserPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-400">Loading form...</div>}>
      <UserFormContent />
    </Suspense>
  );
}