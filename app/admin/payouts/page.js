'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { BANK as BANK_LABELS, PAYOUT_STATUS as PAYOUT_STATUS_LABELS } from '../../../lib/choices';
import MonthPicker from '../../components/admin/jobs/MonthPicker';

const PAYOUT_STATUS_STYLES = {
  1: 'bg-amber-950/80 text-amber-400 border border-amber-800/60',
  2: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
};

const FILTERS = [
  { key: 'pending', label: 'Pending', status: 1 },
  { key: 'paid', label: 'Paid', status: 2 },
];

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

function formatAmount(amount) {
  return `RM ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const EMPTY_PAYOUT_FORM = { member_uuid: '', period_key: currentMonthKey(), amount: '', note: '' };

export default function PayoutsPage() {
  const [activeFilter, setActiveFilter] = useState('pending');
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Mark-paid confirmation modal
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [bankDetails, setBankDetails] = useState([]);
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [markPaidError, setMarkPaidError] = useState('');

  // Create payout modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [newPayout, setNewPayout] = useState(EMPTY_PAYOUT_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  async function loadPayouts(filterKey) {
    setIsLoading(true);
    setLoadError('');
    try {
      const status = FILTERS.find(f => f.key === filterKey)?.status ?? 1;
      const data = await apiFetch(`${ENDPOINTS.ADMIN.PAYOUTS}?status=${status}&page_size=100`);
      setPayouts(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
      setPayouts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPayouts(activeFilter);
  }, [activeFilter]);

  const openConfirm = async (payout) => {
    setSelectedPayout(payout);
    setMarkPaidError('');
    setBankDetails([]);
    setIsBankLoading(true);
    try {
      const data = await apiFetch(ENDPOINTS.ADMIN.MEMBER_BANK_DETAILS(payout.member_uuid));
      setBankDetails(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setBankDetails([]);
    } finally {
      setIsBankLoading(false);
    }
  };

  const closeConfirm = () => {
    setSelectedPayout(null);
    setBankDetails([]);
    setMarkPaidError('');
  };

  const handleMarkPaid = async () => {
    if (!selectedPayout) return;
    setIsMarkingPaid(true);
    setMarkPaidError('');
    try {
      await apiFetch(ENDPOINTS.ADMIN.PAYOUT_MARK_PAID(selectedPayout.uuid), { method: 'PATCH' });
      setPayouts(prev => prev.filter(p => p.uuid !== selectedPayout.uuid));
      closeConfirm();
    } catch (err) {
      setMarkPaidError(formatError(err));
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const openCreateModal = async () => {
    setIsCreateModalOpen(true);
    setCreateError('');
    setNewPayout(EMPTY_PAYOUT_FORM);
    if (members.length === 0) {
      setIsMembersLoading(true);
      try {
        const data = await apiFetch(`${ENDPOINTS.ADMIN.MEMBERS}?status=1&page_size=100`);
        setMembers(Array.isArray(data?.results) ? data.results : []);
      } catch {
        setMembers([]);
      } finally {
        setIsMembersLoading(false);
      }
    }
  };

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');
    try {
      const created = await apiFetch(ENDPOINTS.ADMIN.PAYOUTS, {
        method: 'POST',
        body: JSON.stringify({
          member_uuid: newPayout.member_uuid,
          period_key: newPayout.period_key,
          amount: newPayout.amount,
          note: newPayout.note || undefined,
        }),
      });
      if (activeFilter === 'pending') {
        setPayouts(prev => [created, ...prev]);
      }
      setIsCreateModalOpen(false);
      setNewPayout(EMPTY_PAYOUT_FORM);
    } catch (err) {
      setCreateError(formatError(err));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      {/* Top Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Payout & Withdrawal Requests</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Process creator payouts and mark them as paid once transferred.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === f.key
                    ? 'bg-[#762CFF] text-white'
                    : 'bg-[#18112E] text-slate-400 border border-[#2B1F4A] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#762CFF] to-[#9E36FF] hover:from-[#8638FF] hover:to-[#B13CFF] text-white text-[11px] font-bold transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            + New Payout
          </button>
        </div>
      </div>

      {loadError && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <span>{loadError}</span>
          <button onClick={() => loadPayouts(activeFilter)} className="font-bold underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      {/* Main Payouts Container */}
      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">

        {!isLoading && payouts.length === 0 && !loadError && (
          <p className="text-xs text-slate-400 py-6 text-center">No {activeFilter} payouts.</p>
        )}

        {/* MOBILE VIEW: Cards */}
        <div className="block sm:hidden space-y-3">
          {payouts.map((row) => (
            <div
              key={row.uuid}
              className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#B13CFF]">{row.uuid.slice(0, 8)}</span>
                  <p className="font-bold text-white text-xs mt-0.5 leading-tight">{row.member}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${PAYOUT_STATUS_STYLES[row.status] || PAYOUT_STATUS_STYLES[1]}`}>
                  {PAYOUT_STATUS_LABELS[row.status] || 'Unknown'}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1.5 py-2 border-y border-[#231A3D]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-mono text-emerald-400 font-bold text-xs">{formatAmount(row.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Period:</span>
                  <span className="text-slate-200 font-medium">{row.period_key}</span>
                </div>
                {row.note && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 shrink-0">Note:</span>
                    <span className="text-slate-300 truncate">{row.note}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] text-slate-400">{formatDate(row.status === 2 ? row.paid_at : row.created)}</span>
                {row.status === 1 ? (
                  <button
                    onClick={() => openConfirm(row)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Mark Paid
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold px-2 py-1 bg-[#140E28] rounded-lg border border-[#231A3D]">
                    ✓ Paid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: Data Table */}
        {payouts.length > 0 && (
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Payout ID</th>
                  <th className="pb-3 px-3">Influencer</th>
                  <th className="pb-3 px-3">Period</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Note</th>
                  <th className="pb-3 px-3">{activeFilter === 'paid' ? 'Paid At' : 'Requested'}</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1438]">
                {payouts.map((row) => (
                  <tr key={row.uuid} className="hover:bg-[#1A1230]/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#B13CFF]" title={row.uuid}>{row.uuid.slice(0, 8)}</td>
                    <td className="py-3.5 px-3 font-bold text-white">{row.member}</td>
                    <td className="py-3.5 px-3 text-slate-300">{row.period_key}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400 text-sm">{formatAmount(row.amount)}</td>
                    <td className="py-3.5 px-3 text-slate-400 truncate max-w-[160px]">{row.note || '—'}</td>
                    <td className="py-3.5 px-3 text-slate-400">{formatDate(row.status === 2 ? row.paid_at : row.created)}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${PAYOUT_STATUS_STYLES[row.status] || PAYOUT_STATUS_STYLES[1]}`}>
                        {PAYOUT_STATUS_LABELS[row.status] || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {row.status === 1 ? (
                        <button
                          onClick={() => openConfirm(row)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer shadow-md"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MARK PAID CONFIRMATION MODAL ================= */}
      {selectedPayout && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 shadow-2xl space-y-4 relative">

            <div className="flex items-center gap-3 border-b border-[#231A3D] pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-base">
                ⚠️
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Confirm Payout Approval</h3>
                <p className="text-[10px] font-mono text-[#B13CFF]">{selectedPayout.uuid.slice(0, 8)}</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#18112E] border border-[#281B45] rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Creator:</span>
                <span className="text-white font-bold">{selectedPayout.member}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Period:</span>
                <span className="text-slate-200">{selectedPayout.period_key}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">{formatAmount(selectedPayout.amount)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Details</p>
              {isBankLoading ? (
                <p className="text-[11px] text-slate-500">Loading...</p>
              ) : bankDetails.length === 0 ? (
                <p className="text-[11px] text-slate-500">No bank details on file for this member.</p>
              ) : (
                bankDetails.map((b) => (
                  <div key={b.uuid} className="p-2.5 bg-[#18112E] border border-[#281B45] rounded-xl text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{BANK_LABELS[b.bank] || 'Bank'}{b.is_primary ? ' (Primary)' : ''}</span>
                      <span className="font-mono text-slate-200">{b.account_number}</span>
                    </div>
                    <p className="text-slate-500">{b.account_holder_name}</p>
                  </div>
                ))
              )}
            </div>

            {markPaidError && <p className="text-rose-400 text-[11px]">{markPaidError}</p>}

            <p className="text-[11px] text-slate-400 px-1 leading-relaxed">
              Have you already transferred this amount to the creator&apos;s account? Marking paid cannot be undone here.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={closeConfirm}
                className="flex-1 py-2.5 rounded-xl border border-[#2B1F4A] hover:bg-[#1A1230] text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isMarkingPaid}
                onClick={handleMarkPaid}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isMarkingPaid && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Yes, Mark Paid</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= CREATE PAYOUT MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-base font-bold text-white">New Payout</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreatePayout} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-[#B13CFF] uppercase">Influencer</label>
                <select
                  required
                  disabled={isMembersLoading}
                  value={newPayout.member_uuid}
                  onChange={(e) => setNewPayout({ ...newPayout, member_uuid: e.target.value })}
                  className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">{isMembersLoading ? 'Loading members...' : 'Select a member'}</option>
                  {members.map((m) => (
                    <option key={m.uuid} value={m.uuid}>{m.full_name || m.username}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#B13CFF] uppercase block mb-1">Period</label>
                  <MonthPicker
                    value={newPayout.period_key}
                    onChange={(value) => setNewPayout({ ...newPayout, period_key: value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#B13CFF] uppercase">Amount (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newPayout.amount}
                    onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Note (optional)</label>
                <textarea
                  rows={2}
                  value={newPayout.note}
                  onChange={(e) => setNewPayout({ ...newPayout, note: e.target.value })}
                  className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {createError && <p className="text-rose-400 text-[11px]">{createError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-[#2B1F4A] text-slate-400 rounded-xl text-xs cursor-pointer">Cancel</button>
                <button type="submit" disabled={isCreating} className="px-5 py-2 bg-[#762CFF] hover:bg-[#8B31FF] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50">
                  {isCreating ? 'Creating...' : 'Create Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
