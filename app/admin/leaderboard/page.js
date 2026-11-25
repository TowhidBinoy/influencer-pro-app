'use client';

import { useState, useEffect, useCallback } from 'react';
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

function formatAmount(amount) {
  return `RM${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Third-party influencer-marketing leaderboard (doc/API.md §20a). This
 * proxy is IsAdmin-only — a member's own token gets a 403 calling it
 * directly, so this view lives here rather than in the member app.
 * Ranked by total deposit amount this calendar month, upstream data.
 */
export default function AdminLeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.ADMIN.INFLUENCER_LEADERBOARD);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  const filteredRows = rows.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (r.full_name || '').toLowerCase().includes(term) || (r.phone_number || '').includes(term);
  });

  const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Influencer Leaderboard</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Ranked by total deposit amount this month. Live data from the referral platform.</p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none w-full shadow-inner"
          />
        </div>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadLeaderboard} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading leaderboard...</p>
        ) : filteredRows.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No ranked influencers this month yet.</p>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="block sm:hidden space-y-3">
              {filteredRows.map((r) => (
                <div key={r.member_uuid} className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-[#B13CFF] w-8 text-center">{RANK_MEDAL[r.rank] || `#${r.rank}`}</span>
                    <div>
                      <p className="font-bold text-white text-xs">{r.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.phone_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-mono font-bold text-xs">{formatAmount(r.deposit_amount)}</p>
                    <p className="text-[9px] text-slate-500">{r.reg_count} reg · {r.cvs_count} conv</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Rank</th>
                    <th className="pb-3 px-3">Influencer</th>
                    <th className="pb-3 px-3">Phone</th>
                    <th className="pb-3 px-3">Referrals (Reg / Converted)</th>
                    <th className="pb-3 px-3 text-right">Deposit Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {filteredRows.map((r) => (
                    <tr key={r.member_uuid} className="hover:bg-[#1A1230]/50 transition-colors">
                      <td className="py-3.5 px-3 font-black text-[#B13CFF] text-sm">{RANK_MEDAL[r.rank] || `#${r.rank}`}</td>
                      <td className="py-3.5 px-3 font-bold text-white">{r.full_name}</td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono">{r.phone_number}</td>
                      <td className="py-3.5 px-3 text-slate-300">{r.reg_count} / {r.cvs_count}</td>
                      <td className="py-3.5 px-3 text-right text-emerald-400 font-mono font-bold">{formatAmount(r.deposit_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
