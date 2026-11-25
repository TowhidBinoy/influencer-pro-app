'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { useToast } from '../../components/admin/ui/Toast';

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

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PendingApplicationsPage() {
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [actionTarget, setActionTarget] = useState(null); // { row, action: 'approve'|'reject' }
  const [isActing, setIsActing] = useState(false);
  const [approveLink, setApproveLink] = useState('');

  const loadRows = useCallback(async (search) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const qs = new URLSearchParams({ page_size: '100' });
      if (search) qs.set('search', search);
      const data = await apiFetch(`${ENDPOINTS.ADMIN.APPLICATIONS_PENDING}?${qs.toString()}`);
      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => loadRows(searchTerm), 300);
    return () => clearTimeout(handle);
  }, [searchTerm, loadRows]);

  const runAction = async () => {
    if (!actionTarget) return;
    const { row, action } = actionTarget;
    setIsActing(true);
    try {
      const endpoint = action === 'approve'
        ? ENDPOINTS.ADMIN.JOB_MEMBER_APPROVE(row.org_uuid, row.job_uuid, row.uuid)
        : ENDPOINTS.ADMIN.JOB_MEMBER_REJECT(row.org_uuid, row.job_uuid, row.uuid);

      const body = action === 'approve' && approveLink.trim()
        ? JSON.stringify({ affiliate_link: approveLink.trim() })
        : undefined;

      await apiFetch(endpoint, { method: 'PATCH', body });
      setRows((prev) => prev.filter((r) => r.uuid !== row.uuid));
      toast.success(action === 'approve' ? 'Application approved.' : 'Application rejected.');
      setActionTarget(null);
      setApproveLink('');
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsActing(false);
    }
  };

  const ACTION_COPY = {
    approve: { title: 'Approve application?', message: `${actionTarget?.row?.member} will be marked active on ${actionTarget?.row?.job_title}.`, confirmLabel: 'Approve', tone: 'primary' },
    reject: { title: 'Reject application?', message: `${actionTarget?.row?.member} will be rejected from ${actionTarget?.row?.job_title}.`, confirmLabel: 'Reject', tone: 'destructive' },
  };

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Pending Applications</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Every applicant awaiting approval, across all companies and jobs.</p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name, username, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none w-full shadow-inner"
          />
        </div>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={() => loadRows(searchTerm)} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading applications...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No pending applications. All caught up.</p>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="block sm:hidden space-y-3">
              {rows.map((r) => (
                <div key={r.uuid} className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white text-xs leading-tight">{r.member}</p>
                      <p className="text-[10px] text-slate-400">@{r.username}</p>
                    </div>
                    <StatusBadge tone="warning" showDot={false}>Applied</StatusBadge>
                  </div>
                  <p className="text-[11px] text-slate-300">{r.job_title}</p>
                  <p className="text-[10px] text-[#B13CFF]">{r.org}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setActionTarget({ row: r, action: 'reject' })}
                      className="flex-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg text-[11px] font-bold text-rose-300 transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setActionTarget({ row: r, action: 'approve' })}
                      className="flex-1 px-3 py-1.5 bg-[#762CFF] hover:bg-[#8B31FF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Member</th>
                    <th className="pb-3 px-3">Job</th>
                    <th className="pb-3 px-3">Company</th>
                    <th className="pb-3 px-3">Applied</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {rows.map((r) => (
                    <tr key={r.uuid} className="hover:bg-[#1A1230]/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white">{r.member}</p>
                        <p className="text-[#B13CFF] font-mono text-[10px]">@{r.username}</p>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{r.job_title}</td>
                      <td className="py-3.5 px-3 text-slate-300">{r.org}</td>
                      <td className="py-3.5 px-3 text-slate-300">{formatDate(r.created)}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActionTarget({ row: r, action: 'reject' })}
                            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg text-[11px] font-bold text-rose-300 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setActionTarget({ row: r, action: 'approve' })}
                            className="px-3 py-1.5 bg-[#762CFF] hover:bg-[#8B31FF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!actionTarget}
        title={actionTarget ? ACTION_COPY[actionTarget.action].title : ''}
        message={actionTarget ? ACTION_COPY[actionTarget.action].message : ''}
        confirmLabel={actionTarget ? ACTION_COPY[actionTarget.action].confirmLabel : ''}
        tone={actionTarget ? ACTION_COPY[actionTarget.action].tone : 'primary'}
        loading={isActing}
        onConfirm={runAction}
        onCancel={() => { setActionTarget(null); setApproveLink(''); }}
        preview={actionTarget?.action === 'approve' ? (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Affiliate Link (optional)</label>
            <input
              type="url"
              value={approveLink}
              onChange={(e) => setApproveLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 focus:border-[#9033FF] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        ) : undefined}
      />
    </div>
  );
}
