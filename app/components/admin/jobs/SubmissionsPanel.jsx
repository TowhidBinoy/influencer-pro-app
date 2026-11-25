'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import {
  CONTENT_TYPE as CONTENT_TYPE_LABELS,
  PLATFORM as PLATFORM_LABELS,
  SUBMISSION_STATUS as SUBMISSION_STATUS_LABELS,
} from '../../../../lib/choices';
import ConfirmDialog from '../ui/ConfirmDialog';
import StatusBadge from '../ui/StatusBadge';

const SUBMISSION_STATUS_TONE = { 1: 'neutral', 2: 'warning', 3: 'success', 4: 'danger', 5: 'neutral' };

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Awaiting Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
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

function formatSubmittedAt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Submissions for a single job — doc/API.md §15 (/jobs/job/{job_uuid}/submission/...).
 * `job` needs only `uuid` and `title` to render.
 */
export default function SubmissionsPanel({ toast, job }) {
  const [activeFilter, setActiveFilter] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject' | null

  const loadSubmissions = useCallback(async (filterKey) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const path = filterKey
        ? filterKey === 'pending' ? ENDPOINTS.ADMIN.SUBMISSIONS_PENDING(job.uuid)
        : filterKey === 'approved' ? ENDPOINTS.ADMIN.SUBMISSIONS_APPROVED(job.uuid)
        : ENDPOINTS.ADMIN.SUBMISSIONS_REJECTED(job.uuid)
        : ENDPOINTS.ADMIN.SUBMISSIONS(job.uuid);
      const data = await apiFetch(`${path}?page_size=100`);
      setSubmissions(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [job.uuid]);

  useEffect(() => { loadSubmissions(activeFilter); }, [loadSubmissions, activeFilter]);

  const closeModal = () => {
    setSelectedSubmission(null);
    setRejectReason('');
    setActionError('');
    setConfirmAction(null);
  };

  const runApprove = async () => {
    if (!selectedSubmission) return;
    setIsActionLoading(true);
    setActionError('');
    try {
      await apiFetch(ENDPOINTS.ADMIN.SUBMISSION_APPROVE(job.uuid, selectedSubmission.uuid), { method: 'PATCH' });
      toast?.success('Submission approved.');
      closeModal();
      loadSubmissions(activeFilter);
    } catch (err) {
      setActionError(formatError(err));
      setConfirmAction(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const runReject = async () => {
    if (!selectedSubmission) return;
    if (!rejectReason.trim()) {
      setActionError('A reject reason is required.');
      setConfirmAction(null);
      return;
    }
    setIsActionLoading(true);
    setActionError('');
    try {
      await apiFetch(ENDPOINTS.ADMIN.SUBMISSION_REJECT(job.uuid, selectedSubmission.uuid), {
        method: 'PATCH',
        body: JSON.stringify({ reject_reason: rejectReason.trim() }),
      });
      toast?.success('Submission rejected.');
      closeModal();
      loadSubmissions(activeFilter);
    } catch (err) {
      setActionError(formatError(err));
      setConfirmAction(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const canReview = selectedSubmission?.status === 2;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key || 'all'}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeFilter === f.key ? 'bg-[#762CFF] text-white' : 'bg-[#18112E] text-slate-400 border border-[#2B1F4A] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <span>{loadError}</span>
          <button onClick={() => loadSubmissions(activeFilter)} className="font-bold underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No submissions in this view.</p>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="block sm:hidden space-y-3">
              {submissions.map((row) => (
                <div key={row.uuid} className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#B13CFF]">{row.uuid.slice(0, 8)}</span>
                      <p className="font-bold text-white text-xs mt-0.5 leading-tight">{row.member}</p>
                    </div>
                    <StatusBadge tone={SUBMISSION_STATUS_TONE[row.status] || 'neutral'}>
                      {SUBMISSION_STATUS_LABELS[row.status] || 'Unknown'}
                    </StatusBadge>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1.5 py-2 border-y border-[#231A3D]">
                    <p><span className="text-slate-500">Content:</span> {CONTENT_TYPE_LABELS[row.content_type] || '—'} ({PLATFORM_LABELS[row.platform] || '—'})</p>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] text-slate-400">{formatSubmittedAt(row.submitted_at)}</span>
                    <button
                      onClick={() => setSelectedSubmission(row)}
                      className="px-3.5 py-1.5 bg-[#762CFF] hover:bg-[#8B31FF] rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      {row.status === 2 ? 'Audit Proof' : 'View'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Sub ID</th>
                    <th className="pb-3 px-3">Influencer</th>
                    <th className="pb-3 px-3">Content</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {submissions.map((row) => (
                    <tr key={row.uuid} className="hover:bg-[#1A1230]/50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#B13CFF]" title={row.uuid}>{row.uuid.slice(0, 8)}</td>
                      <td className="py-3.5 px-3 font-semibold text-white">{row.member}</td>
                      <td className="py-3.5 px-3 text-slate-300">{CONTENT_TYPE_LABELS[row.content_type] || '—'} ({PLATFORM_LABELS[row.platform] || '—'})</td>
                      <td className="py-3.5 px-3 text-slate-400">{formatSubmittedAt(row.submitted_at)}</td>
                      <td className="py-3.5 px-3">
                        <StatusBadge tone={SUBMISSION_STATUS_TONE[row.status] || 'neutral'}>
                          {SUBMISSION_STATUS_LABELS[row.status] || 'Unknown'}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedSubmission(row)}
                          className="px-3.5 py-1.5 bg-[#762CFF] hover:bg-[#8B31FF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer shadow-md"
                        >
                          {row.status === 2 ? 'Audit Proof' : 'View'}
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

      {/* ================= REVIEW MODAL ================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Review Submission</h3>
                <p className="text-[10px] font-mono text-[#B13CFF]">{selectedSubmission.uuid.slice(0, 8)}</p>
              </div>
              <button onClick={closeModal} className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#18112E] border border-[#281B45] rounded-xl space-y-1">
                <p className="text-slate-400">Creator: <span className="text-white font-bold">{selectedSubmission.member}</span></p>
                <p className="text-slate-400">Content: <span className="text-white font-semibold">{CONTENT_TYPE_LABELS[selectedSubmission.content_type] || '—'} ({PLATFORM_LABELS[selectedSubmission.platform] || '—'})</span></p>
              </div>

              {selectedSubmission.note && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Notes from Influencer</p>
                  <div className="p-3 bg-[#18112E] border border-[#281B45] rounded-xl text-slate-200 text-xs">{selectedSubmission.note}</div>
                </div>
              )}

              {(selectedSubmission.proof_link || selectedSubmission.proof_file) && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Proof</p>
                  <a
                    href={selectedSubmission.proof_link || selectedSubmission.proof_file}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#18112E] border border-[#2B1F4A] hover:border-[#762CFF] rounded-xl p-2.5 text-xs text-[#B13CFF] hover:underline break-all block"
                  >
                    {selectedSubmission.proof_link || selectedSubmission.proof_file} ↗
                  </a>
                </div>
              )}

              {selectedSubmission.status === 4 && selectedSubmission.reject_reason && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-rose-400">Reject Reason</p>
                  <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-200 text-xs">{selectedSubmission.reject_reason}</div>
                </div>
              )}

              {canReview && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Reject Reason (required to reject)</p>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this submission is being rejected..."
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              )}

              {actionError && <p className="text-rose-400 text-[11px]">{actionError}</p>}
            </div>

            {canReview ? (
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  disabled={isActionLoading}
                  onClick={() => setConfirmAction('reject')}
                  className="flex-1 py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Reject Proof
                </button>
                <button
                  disabled={isActionLoading}
                  onClick={() => setConfirmAction('approve')}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isActionLoading ? 'Updating...' : 'Approve'}
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <span className="inline-block">
                  <StatusBadge tone={SUBMISSION_STATUS_TONE[selectedSubmission.status] || 'neutral'}>
                    {SUBMISSION_STATUS_LABELS[selectedSubmission.status] || 'Unknown'} — already reviewed
                  </StatusBadge>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmAction === 'approve'}
        title="Approve this submission?"
        message={`${selectedSubmission?.member}'s submission will be approved.`}
        confirmLabel="Approve"
        tone="primary"
        loading={isActionLoading}
        onConfirm={runApprove}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === 'reject'}
        title="Reject this submission?"
        message={`${selectedSubmission?.member}'s submission will be rejected with the reason you provided.`}
        confirmLabel="Reject Proof"
        tone="destructive"
        loading={isActionLoading}
        onConfirm={runReject}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
