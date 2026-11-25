'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { MEMBER_STATUS as MEMBER_STATUS_LABELS } from '../../../lib/choices';
import MonthPicker from '../../components/admin/jobs/MonthPicker';

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

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const SORT_OPTIONS = [
  { value: '-total', label: 'Total (High to Low)' },
  { value: 'total', label: 'Total (Low to High)' },
  { value: '-missed', label: 'Missed (High to Low)' },
  { value: 'missed', label: 'Missed (Low to High)' },
  { value: '-deduction', label: 'Deduction (High to Low)' },
  { value: 'deduction', label: 'Deduction (Low to High)' },
  { value: 'name', label: 'Name (A-Z)' },
];

const STATUS_STYLES = {
  1: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
  2: 'bg-slate-800 text-slate-400 border border-slate-700',
  3: 'bg-rose-950/80 text-rose-400 border border-rose-800/60',
};

export default function EarningsPage() {
  const [kpi, setKpi] = useState(null);
  const [isKpiLoading, setIsKpiLoading] = useState(true);

  const [month, setMonth] = useState(currentMonthKey());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-total');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');

  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadKpi() {
      setIsKpiLoading(true);
      try {
        const data = await apiFetch(ENDPOINTS.ADMIN.EARNINGS_KPI);
        setKpi(data);
      } catch {
        setKpi(null);
      } finally {
        setIsKpiLoading(false);
      }
    }
    loadKpi();
  }, []);

  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const qs = new URLSearchParams({ month, sort, page_size: '100' });
      if (search.trim()) qs.set('search', search.trim());
      if (status) qs.set('status', status);
      if (minTotal) qs.set('min_total', minTotal);
      if (maxTotal) qs.set('max_total', maxTotal);

      const data = await apiFetch(`${ENDPOINTS.ADMIN.EARNINGS_STATISTICS}?${qs.toString()}`);
      setSummary(data?.summary || null);
      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
      setSummary(null);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [month, search, status, sort, minTotal, maxTotal]);

  useEffect(() => {
    const timer = setTimeout(loadStatistics, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [loadStatistics, search]);

  const kpiTiles = [
    { label: 'Members', value: kpi ? kpi.member_count.toLocaleString() : '—', icon: '👥' },
    { label: 'Earning This Month', value: kpi ? kpi.earning_member_count.toLocaleString() : '—', icon: '💰' },
    { label: 'Missed This Month', value: kpi ? kpi.missed_member_count.toLocaleString() : '—', icon: '⚠️' },
    { label: 'Base Pay', value: kpi ? formatAmount(kpi.base_pay) : '—', icon: '💵' },
    { label: 'Deductions', value: kpi ? formatAmount(kpi.deduction) : '—', icon: '➖' },
    { label: 'Total Payable', value: kpi ? formatAmount(kpi.total) : '—', icon: '📊' },
  ];

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      <div className="shrink-0">
        <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Earnings</h2>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Per-member earnings breakdown, deductions, and current-month totals.</p>
      </div>

      {/* KPI Tiles — always current month */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 shrink-0">
        {kpiTiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-[#120D22] border border-[#231A3D] rounded-2xl p-3.5 sm:p-4.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">{tile.label}</p>
              <span className="text-xs sm:text-sm opacity-80">{tile.icon}</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white mt-1 sm:mt-1.5 tracking-tight">
              {isKpiLoading ? '…' : tile.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Month</label>
            <MonthPicker value={month} onChange={setMonth} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Search</label>
            <input
              type="text"
              placeholder="Name or username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#18112E] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-2.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#18112E] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">All</option>
              {Object.entries(MEMBER_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-[#18112E] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Min Total</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              className="w-full bg-[#18112E] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-2.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Max Total</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={maxTotal}
              onChange={(e) => setMaxTotal(e.target.value)}
              className="w-full bg-[#18112E] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-2.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {loadError && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <span>{loadError}</span>
          <button onClick={loadStatistics} className="font-bold underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      {/* Period summary strip */}
      {summary && (
        <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-wrap gap-x-6 gap-y-2 text-xs shrink-0">
          <span className="text-slate-400">Period: <span className="text-white font-semibold">{summary.period_key}</span></span>
          <span className="text-slate-400">Members: <span className="text-white font-semibold">{summary.member_count}</span></span>
          <span className="text-slate-400">Earning: <span className="text-emerald-400 font-semibold">{summary.earning_member_count}</span></span>
          <span className="text-slate-400">Missed: <span className="text-rose-400 font-semibold">{summary.missed_member_count}</span></span>
          <span className="text-slate-400">Base Pay: <span className="text-white font-semibold font-mono">{formatAmount(summary.base_pay)}</span></span>
          <span className="text-slate-400">Deduction: <span className="text-rose-400 font-semibold font-mono">{formatAmount(summary.deduction)}</span></span>
          <span className="text-slate-400">Total: <span className="text-emerald-400 font-bold font-mono">{formatAmount(summary.total)}</span></span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading earnings...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No members match this filter.</p>
        ) : (
          <>
            {/* MOBILE VIEW: Cards */}
            <div className="block sm:hidden space-y-3">
              {rows.map((row) => (
                <div key={row.member_uuid} className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white text-xs leading-tight">{row.full_name}</p>
                      <p className="text-[10px] text-slate-400">@{row.username}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${STATUS_STYLES[row.status] || STATUS_STYLES[2]}`}>
                      {MEMBER_STATUS_LABELS[row.status] || 'Unknown'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#231A3D] text-[11px]">
                    <div><span className="text-slate-500">Jobs:</span> <span className="text-slate-200 font-medium">{row.job_count}</span></div>
                    <div><span className="text-slate-500">Posted:</span> <span className="text-slate-200 font-medium">{row.posted_count}</span></div>
                    <div><span className="text-slate-500">Missed:</span> <span className="text-rose-400 font-medium">{row.missed_count}</span></div>
                    <div><span className="text-slate-500">Deduction:</span> <span className="text-rose-400 font-medium font-mono">{formatAmount(row.deduction)}</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Base: {formatAmount(row.base_pay)}</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">{formatAmount(row.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Member</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Jobs</th>
                    <th className="pb-3 px-3">Base Pay</th>
                    <th className="pb-3 px-3">Posted</th>
                    <th className="pb-3 px-3">Missed</th>
                    <th className="pb-3 px-3">Deduction</th>
                    <th className="pb-3 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {rows.map((row) => (
                    <tr key={row.member_uuid} className="hover:bg-[#1A1230]/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white">{row.full_name}</p>
                        <p className="text-[#B13CFF] font-mono text-[10px]">@{row.username}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[row.status] || STATUS_STYLES[2]}`}>
                          {MEMBER_STATUS_LABELS[row.status] || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{row.job_count}</td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono">{formatAmount(row.base_pay)}</td>
                      <td className="py-3.5 px-3 text-slate-300">{row.posted_count}</td>
                      <td className="py-3.5 px-3 text-rose-400">{row.missed_count}</td>
                      <td className="py-3.5 px-3 text-rose-400 font-mono">{formatAmount(row.deduction)}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-400">{formatAmount(row.total)}</td>
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
