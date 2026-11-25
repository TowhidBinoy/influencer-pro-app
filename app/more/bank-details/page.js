'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import NotificationBell from '../../components/NotificationBell';
import GuideHelp from '../../components/GuideHelp';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { BANK as BANK_LABELS } from '../../../lib/choices';

const EMPTY_FORM = { bank: 1, account_holder_name: '', account_number: '', is_primary: true };

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

export default function BankDetailsPage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUuid, setEditingUuid] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    if (!token) {
      router.push('/');
      return;
    }
    loadAccounts();
  }, [router]);

  async function loadAccounts() {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.BANK_DETAILS);
      setAccounts(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }

  const openCreate = () => {
    setEditingUuid(null);
    setForm(EMPTY_FORM);
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const openEdit = (account) => {
    setEditingUuid(account.uuid);
    setForm({
      bank: account.bank,
      account_holder_name: account.account_holder_name,
      account_number: account.account_number,
      is_primary: account.is_primary,
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.account_number.replace(/\D/g, '').length < 8) {
      setErrorMsg('Please enter a valid numeric account number (at least 8 digits).');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        bank: Number(form.bank),
        account_holder_name: form.account_holder_name.trim(),
        account_number: form.account_number.trim(),
        is_primary: form.is_primary,
      };

      if (editingUuid) {
        const updated = await apiFetch(ENDPOINTS.MEMBER.BANK_DETAIL(editingUuid), {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setAccounts((prev) => prev.map((a) => (a.uuid === updated.uuid ? updated : (payload.is_primary ? { ...a, is_primary: false } : a))));
      } else {
        const created = await apiFetch(ENDPOINTS.MEMBER.BANK_DETAILS, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setAccounts((prev) => [created, ...(payload.is_primary ? prev.map((a) => ({ ...a, is_primary: false })) : prev)]);
      }

      setIsEditModalOpen(false);
    } catch (err) {
      setErrorMsg(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async (account) => {
    if (!window.confirm(`Remove this ${BANK_LABELS[account.bank] || 'bank'} account?`)) return;
    try {
      await apiFetch(ENDPOINTS.MEMBER.BANK_DETAIL_ARCHIVE(account.uuid), { method: 'PATCH' });
      setAccounts((prev) => prev.filter((a) => a.uuid !== account.uuid));
    } catch (err) {
      setLoadError(formatError(err));
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">

      {/* Background Glow Effect */}
      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      {/* 1. TOP APP HEADER */}
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
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">Bank Details</h1>
          </div>
          <button
            onClick={openCreate}
            className="px-3 py-1.5 bg-[#8B31FF] hover:bg-[#B13CFF] rounded-xl text-[11px] font-bold text-white transition-all cursor-pointer shadow-md"
          >
            + Add
          </button>
        </div>

        <GuideHelp location={10} label="Tips for bank details" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={loadAccounts} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-6 text-center space-y-2">
            <p className="text-xs text-slate-400">No bank account on file yet.</p>
            <button
              onClick={openCreate}
              style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Add Bank Account
            </button>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.uuid} className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3 relative">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="text-[#B13CFF]">🏦</span> {BANK_LABELS[account.bank] || 'Bank'}
                </p>
                {account.is_primary && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✓ Primary
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <p className="text-[9px] font-medium text-slate-400 uppercase">Account holder name</p>
                  <p className="text-xs font-bold text-white mt-0.5">{account.account_holder_name}</p>
                </div>
                <div>
                  <p className="text-[9px] font-medium text-slate-400 uppercase">Account number</p>
                  <p className="text-xs font-bold text-white tracking-widest mt-0.5">{account.account_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => openEdit(account)}
                  className="flex-1 py-2 bg-[#1C1438] hover:bg-[#2B1F4A] border border-[#762CFF]/50 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(account)}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}

      </main>

      {/* EDIT / CREATE BANK DETAILS MODAL */}
      {isEditModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#120C22] border border-[#2B1F4A] rounded-2xl p-5 w-full max-w-[320px] shadow-2xl relative text-center">

            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs font-bold w-6 h-6 rounded-full bg-[#1A1230] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-sm font-bold text-white mb-1">{editingUuid ? 'Edit' : 'Add'} Payment Account</h3>
            <p className="text-[10px] text-slate-400 mb-3">Ensure your bank details match your IC/Passport name.</p>

            {errorMsg && (
              <div className="mb-3 p-2 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-[11px] font-semibold rounded-lg">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-2.5 text-left">
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-1">Select Bank</label>
                <select
                  value={form.bank}
                  onChange={(e) => setForm({ ...form, bank: e.target.value })}
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  {Object.entries(BANK_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={form.account_holder_name}
                  onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })}
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-1">Account Number (Numbers only)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={20}
                  required
                  value={form.account_number}
                  onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 164019284910"
                  className="w-full bg-[#0E091D] border border-[#231A3D] focus:border-[#B13CFF] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
                  className="w-3.5 h-3.5 rounded bg-[#0E091D] border-[#231A3D] accent-[#8B31FF] cursor-pointer"
                />
                Set as primary payout account
              </label>

              <button
                type="submit"
                disabled={isSaving}
                style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:scale-[1.01] transition-all uppercase cursor-pointer mt-2 disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Details'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 3. FIXED BOTTOM NAVIGATION BAR */}
      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
