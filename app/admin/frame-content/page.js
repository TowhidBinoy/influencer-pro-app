'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { TASK_FILE_MEDIA_TYPE as MEDIA_TYPE_LABELS, RENDER_STATUS } from '../../../lib/choices';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import StatusBadge from '../../components/admin/ui/StatusBadge';
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

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_TONE = { 1: 'warning', 2: 'success', 3: 'danger' };

export default function FrameContentPage() {
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('');

  const [jobs, setJobs] = useState([]);

  const [viewingItem, setViewingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const qs = jobFilter ? `?page_size=200&job_uuid=${jobFilter}` : '?page_size=200';
      const data = await apiFetch(`${ENDPOINTS.ADMIN.RENDERED_CONTENT}${qs}`);
      setItems(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, [jobFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiFetch(`${ENDPOINTS.ADMIN.JOB_LIST}?page_size=200`);
        const rows = Array.isArray(data?.results) ? data.results : [];
        rows.sort((a, b) => (a.org || '').localeCompare(b.org || '') || a.title.localeCompare(b.title));
        setJobs(rows);
      } catch {
        setJobs([]);
      }
    }
    loadJobs();
  }, []);

  const filteredItems = items.filter((item) => {
    if (mediaFilter !== 'all' && String(item.media_type) !== mediaFilter) return false;
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (item.member || '').toLowerCase().includes(term) ||
      (item.job_title || '').toLowerCase().includes(term) ||
      (item.org || '').toLowerCase().includes(term) ||
      (item.frame_name || '').toLowerCase().includes(term)
    );
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(ENDPOINTS.ADMIN.RENDERED_CONTENT_ITEM(deleteTarget.uuid), { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.uuid !== deleteTarget.uuid));
      toast.success('Upload deleted.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Member Content</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Raw photos/videos members imported into the Frame Editor, across every job.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none shadow-inner"
          >
            <option value="">All jobs</option>
            {jobs.map((j) => (
              <option key={j.uuid} value={j.uuid}>{j.org} · {j.title}</option>
            ))}
          </select>
          <select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            className="bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none shadow-inner"
          >
            <option value="all">All media</option>
            <option value="1">Video</option>
            <option value="2">Photo</option>
          </select>
          <input
            type="text"
            placeholder="Search by member, job, or frame..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none w-full sm:w-64 shadow-inner"
          />
        </div>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadItems} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading uploads...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No uploads found.</p>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <button
                key={item.uuid}
                type="button"
                onClick={() => setViewingItem(item)}
                className="w-full flex items-center gap-3 bg-[#18112E] border border-[#261A45] hover:border-[#762CFF]/60 rounded-2xl p-3 transition-all cursor-pointer text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-[#0E091C] border border-[#2B1F4A] shrink-0 overflow-hidden flex items-center justify-center">
                  {item.media_type === 1 ? (
                    <video src={item.original_file} className="w-full h-full object-cover" muted />
                  ) : item.original_file ? (
                    <img src={item.original_file} alt={item.original_name || 'upload'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-500">No file</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm truncate">{item.member}</p>
                    <StatusBadge tone={STATUS_TONE[item.render_status] || 'neutral'}>
                      {RENDER_STATUS[item.render_status] || '—'}
                    </StatusBadge>
                  </div>
                  <p className="text-xs font-semibold text-[#B991FF] truncate mt-1">{item.org}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.job_title} · {item.frame_name}</p>
                </div>
                <div className="hidden sm:block text-[11px] font-medium text-slate-400 shrink-0 text-right">
                  <div>{MEDIA_TYPE_LABELS[item.media_type] || '—'}</div>
                  <div className="text-slate-500">{formatDate(item.created)}</div>
                </div>
                <span className="text-slate-500 text-sm font-semibold shrink-0">›</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewingItem && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-sm bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-sm font-bold text-white truncate">{viewingItem.member}</h3>
              <button
                onClick={() => setViewingItem(null)}
                className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="w-full aspect-square rounded-2xl bg-[#0E091C] border border-[#2B1F4A] overflow-hidden flex items-center justify-center">
              {viewingItem.media_type === 1 ? (
                viewingItem.original_file ? (
                  <video src={viewingItem.original_file} className="w-full h-full object-contain" controls />
                ) : (
                  <span className="text-xs text-slate-600">No file</span>
                )
              ) : viewingItem.original_file ? (
                <img src={viewingItem.original_file} alt={viewingItem.original_name || 'upload'} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-600">No file</span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">
                <span className="text-[#B991FF]">{viewingItem.org}</span>
                <span className="text-slate-500 mx-1.5">·</span>
                <span className="text-slate-300">{viewingItem.job_title}</span>
              </p>
              <p className="text-slate-300 font-medium">Frame: <span className="text-white">{viewingItem.frame_name}</span></p>
              <p className="text-slate-300 font-medium">{formatDate(viewingItem.created)} · {MEDIA_TYPE_LABELS[viewingItem.media_type] || '—'}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#231A3D]">
              <button
                type="button"
                onClick={() => { const i = viewingItem; setViewingItem(null); setDeleteTarget(i); }}
                className="flex-1 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-[11px] font-bold transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this upload?"
        message={`This permanently removes ${deleteTarget?.member || 'this member'}'s original file and its framed output, both on disk and in the database. This cannot be undone.`}
        confirmLabel="Delete"
        tone="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
