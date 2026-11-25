'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { MEMBER_STATUS as STATUS_LABELS, BANK as BANK_LABELS } from '../../../lib/choices';
import DatePicker from '../../components/admin/jobs/DatePicker';

const STATUS_STYLES = {
  1: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
  2: 'bg-slate-800 text-slate-400 border border-slate-700',
  3: 'bg-rose-950/80 text-rose-400 border border-rose-800/60',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateOnly(dateKey) {
  if (!dateKey) return '—';
  const [y, m, d] = dateKey.split('-');
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}/${y}`;
}

const EMPTY_FORM = {
  username: '',
  password: '',
  confirm_password: '',
  full_name: '',
  phone_number: '',
  email: '',
  date_of_birth: '',
  status: 1,
};

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

export default function InfluencersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedMember, setSelectedMember] = useState(null);
  const [manageError, setManageError] = useState('');
  const [manageSuccess, setManageSuccess] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [bankDetails, setBankDetails] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [loginAudit, setLoginAudit] = useState([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newMember, setNewMember] = useState(EMPTY_FORM);

  async function loadMembers() {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.ADMIN.MEMBERS}?page_size=100`);
      setMembers(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const handleCreateInfluencer = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (newMember.password !== newMember.confirm_password) {
      setCreateError('Password and confirm password do not match.');
      return;
    }

    setIsCreating(true);
    try {
      const created = await apiFetch(ENDPOINTS.ADMIN.MEMBERS, {
        method: 'POST',
        body: JSON.stringify({
          username: newMember.username.trim(),
          password: newMember.password,
          confirm_password: newMember.confirm_password,
          full_name: newMember.full_name.trim() || undefined,
          phone_number: newMember.phone_number.trim() || undefined,
          email: newMember.email.trim() || undefined,
          date_of_birth: newMember.date_of_birth || undefined,
          status: Number(newMember.status),
        }),
      });

      setMembers((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewMember(EMPTY_FORM);
    } catch (err) {
      setCreateError(formatError(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleChangeStatus = async (nextStatus) => {
    if (!selectedMember) return;
    setIsSavingStatus(true);
    setManageError('');
    setManageSuccess('');
    try {
      const updated = await apiFetch(ENDPOINTS.ADMIN.MEMBER(selectedMember.uuid), {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setSelectedMember(updated);
      setMembers((prev) => prev.map((m) => (m.uuid === updated.uuid ? updated : m)));
      setManageSuccess('Status updated.');
    } catch (err) {
      setManageError(formatError(err));
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedMember) return;
    if (!window.confirm(`Archive ${selectedMember.username}? This deactivates their account.`)) return;
    setIsSavingStatus(true);
    setManageError('');
    try {
      const updated = await apiFetch(ENDPOINTS.ADMIN.MEMBER_ARCHIVE(selectedMember.uuid), { method: 'PATCH' });
      setMembers((prev) => prev.map((m) => (m.uuid === updated.uuid ? updated : m)));
      setSelectedMember(null);
    } catch (err) {
      setManageError(formatError(err));
    } finally {
      setIsSavingStatus(false);
    }
  };

  const openManage = async (row) => {
    setSelectedMember(row);
    setManageError('');
    setManageSuccess('');
    setNewPassword('');
    setBankDetails([]);
    setLoginAudit([]);

    setIsDetailLoading(true);
    setIsAuditLoading(true);

    apiFetch(ENDPOINTS.ADMIN.MEMBER(row.uuid))
      .then((detail) => {
        setSelectedMember((prev) => (prev?.uuid === row.uuid ? { ...prev, ...detail } : prev));
        setBankDetails(Array.isArray(detail?.bank_details) ? detail.bank_details : []);
      })
      .catch(() => {})
      .finally(() => setIsDetailLoading(false));

    apiFetch(`${ENDPOINTS.ADMIN.MEMBER_AUDIT_LOGIN(row.uuid)}?page_size=5`)
      .then((data) => setLoginAudit(Array.isArray(data?.results) ? data.results : []))
      .catch(() => {})
      .finally(() => setIsAuditLoading(false));
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!selectedMember || !newPassword) return;
    setIsSavingPassword(true);
    setManageError('');
    setManageSuccess('');
    try {
      await apiFetch(ENDPOINTS.ADMIN.MEMBER_CHANGE_PASSWORD(selectedMember.uuid), {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword }),
      });
      setNewPassword('');
      setManageSuccess('Password reset.');
    } catch (err) {
      setManageError(formatError(err));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.full_name?.toLowerCase().includes(term) ||
      m.username?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.phone_number?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Member Directory</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Manage registered members and their account status.</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search by name, username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none w-full shadow-inner"
            />
          </div>
          <button
            onClick={() => { setCreateError(''); setNewMember(EMPTY_FORM); setIsCreateModalOpen(true); }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#762CFF]/30 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Create Account
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={loadMembers} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading members...</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No members found.</p>
        ) : (
          <>
            {/* MOBILE VIEW: Cards */}
            <div className="block sm:hidden space-y-3">
              {filteredMembers.map((row) => (
                <div
                  key={row.uuid}
                  className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white text-xs leading-tight">{row.full_name || row.username}</p>
                      <p className="text-[10px] text-slate-400">@{row.username}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${STATUS_STYLES[row.status] || STATUS_STYLES[2]}`}>
                      {STATUS_LABELS[row.status] || 'Unknown'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#231A3D]">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Email</p>
                      <p className="text-[11px] font-medium text-slate-200 mt-0.5 truncate">{row.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Phone</p>
                      <p className="text-[11px] font-medium text-slate-200 mt-0.5 truncate">{row.phone_number || '—'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => openManage(row)}
                    className="w-full py-2 bg-[#221742] hover:bg-[#762CFF] border border-[#32235A] hover:border-[#762CFF] rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Member</th>
                    <th className="pb-3 px-3">Username</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Phone</th>
                    <th className="pb-3 px-3">Joined</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {filteredMembers.map((row) => (
                    <tr key={row.uuid} className="hover:bg-[#1A1230]/50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-white">{row.full_name || '—'}</td>
                      <td className="py-3.5 px-3 text-[#B13CFF] font-mono">@{row.username}</td>
                      <td className="py-3.5 px-3 text-slate-300">{row.email || '—'}</td>
                      <td className="py-3.5 px-3 text-slate-300">{row.phone_number || '—'}</td>
                      <td className="py-3.5 px-3 text-slate-300">{row.joined || '—'}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[row.status] || STATUS_STYLES[2]}`}>
                          {STATUS_LABELS[row.status] || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => openManage(row)}
                          className="px-3.5 py-1.5 bg-[#1F1538] hover:bg-[#762CFF] border border-[#32235A] hover:border-[#762CFF] rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer shadow-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ================= CREATE MEMBER MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-base font-bold text-white">Create Member Account</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#18112E] text-slate-400 hover:text-white border border-[#2B1F4A] flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateInfluencer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Username *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. eliska_m"
                    value={newMember.username}
                    onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Eliska Markova"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Password *</label>
                  <input
                    required
                    type="password"
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm Password *</label>
                  <input
                    required
                    type="password"
                    value={newMember.confirm_password}
                    onChange={(e) => setNewMember({ ...newMember, confirm_password: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="creator@email.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+60 17-882 9102"
                    value={newMember.phone_number}
                    onChange={(e) => setNewMember({ ...newMember, phone_number: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                  <div className="mt-1">
                    <DatePicker
                      value={newMember.date_of_birth}
                      onChange={(val) => setNewMember({ ...newMember, date_of_birth: val })}
                      maxDate={new Date().toISOString().slice(0, 10)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                  <select
                    value={newMember.status}
                    onChange={(e) => setNewMember({ ...newMember, status: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    <option value={1}>Active</option>
                    <option value={2}>Inactive</option>
                    <option value={3}>Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#2B1F4A] text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-gradient-to-r from-[#762CFF] to-[#B13CFF] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#762CFF]/30 cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MANAGE MEMBER MODAL ================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 relative max-h-[90dvh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#762CFF] to-[#B13CFF] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#762CFF]/30">
                  {(selectedMember.full_name || selectedMember.username || '??').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-none">{selectedMember.full_name || selectedMember.username}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${STATUS_STYLES[selectedMember.status] || STATUS_STYLES[2]}`}>
                      {STATUS_LABELS[selectedMember.status] || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-xs text-[#B13CFF] font-medium mt-1">@{selectedMember.username}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-[#18112E] text-slate-400 hover:text-white border border-[#2B1F4A] flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {manageError && (
              <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl">
                {manageError}
              </div>
            )}
            {manageSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-xl">
                {manageSuccess}
              </div>
            )}

            {/* Details */}
            <div className="bg-[#18112E] border border-[#281B45] rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white">{selectedMember.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="text-white">{selectedMember.phone_number || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Date of Birth</span><span className="text-white">{formatDateOnly(selectedMember.date_of_birth)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Joined</span><span className="text-white">{selectedMember.joined || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Last Login</span><span className="text-white">{formatDateTime(selectedMember.last_login)}</span></div>
            </div>

            {/* Bank Details — read-only for admin, see doc/API.md §10 */}
            <div className="bg-[#18112E] border border-[#281B45] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider">Bank Details</p>
              {isDetailLoading ? (
                <p className="text-[11px] text-slate-500">Loading...</p>
              ) : bankDetails.length === 0 ? (
                <p className="text-[11px] text-slate-500">No bank details on file.</p>
              ) : (
                <div className="space-y-1.5">
                  {bankDetails.map((b) => (
                    <div key={b.uuid} className="p-2.5 bg-[#100B1F] border border-[#2B1F4A] rounded-xl text-[11px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{BANK_LABELS[b.bank] || 'Bank'}{b.is_primary ? ' (Primary)' : ''}</span>
                        <span className="font-mono text-slate-200">{b.account_number}</span>
                      </div>
                      <p className="text-slate-500">{b.account_holder_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Login Activity — /members/{uuid}/audit_login/, admin-only */}
            <div className="bg-[#18112E] border border-[#281B45] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider">Recent Login Activity</p>
              {isAuditLoading ? (
                <p className="text-[11px] text-slate-500">Loading...</p>
              ) : loginAudit.length === 0 ? (
                <p className="text-[11px] text-slate-500">No login history yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {loginAudit.map((entry) => (
                    <div key={entry.uuid} className="p-2.5 bg-[#100B1F] border border-[#2B1F4A] rounded-xl text-[11px] flex items-center justify-between gap-2">
                      <div>
                        <p className="text-slate-200">{formatDateTime(entry.datetime)}</p>
                        <p className="text-slate-500 truncate max-w-[220px]">{entry.device || 'Unknown device'}</p>
                      </div>
                      <span className="font-mono text-slate-400 shrink-0">{entry.ip_address || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Change */}
            <div className="bg-[#18112E] border border-[#281B45] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider">Account Status</p>
              <div className="flex gap-2">
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isSavingStatus || Number(value) === selectedMember.status}
                    onClick={() => handleChangeStatus(Number(value))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed ${
                      Number(value) === selectedMember.status
                        ? 'bg-[#762CFF] border-[#762CFF] text-white'
                        : 'bg-[#100B1F] border-[#2B1F4A] text-slate-300 hover:border-[#762CFF]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Password */}
            <form onSubmit={handleSetPassword} className="bg-[#18112E] border border-[#281B45] rounded-2xl p-4 space-y-2.5">
              <p className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider">Reset Password</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 bg-[#100B1F] border border-[#2B1F4A] focus:border-[#B13CFF] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSavingPassword || !newPassword}
                  className="px-4 py-2 bg-[#762CFF] hover:bg-[#8B31FF] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingPassword ? 'Saving...' : 'Set'}
                </button>
              </div>
            </form>

            {/* Archive */}
            <button
              type="button"
              onClick={handleArchive}
              disabled={isSavingStatus}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-rose-950/40 hover:bg-rose-900 border-rose-800/80 text-rose-300 disabled:opacity-50"
            >
              Archive Account
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
