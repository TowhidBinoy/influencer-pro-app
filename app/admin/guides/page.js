'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { GUIDE_LOCATION as LOCATION_LABELS } from '../../../lib/choices';
import Button from '../../components/admin/ui/Button';
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

const EMPTY_FORM = { location: 1, title: '', content: '', ordering: 0 };

export default function GuidesPage() {
  const toast = useToast();

  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const loadGuides = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const qs = new URLSearchParams({ page_size: '100' });
      if (locationFilter) qs.set('location', locationFilter);
      const data = await apiFetch(`${ENDPOINTS.ADMIN.GUIDES}?${qs.toString()}`);
      setGuides(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, [locationFilter]);

  useEffect(() => { loadGuides(); }, [loadGuides]);

  const openCreate = () => {
    setEditingGuide(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (guide) => {
    setEditingGuide(guide);
    setForm({
      location: guide.location,
      title: guide.title || '',
      content: guide.content || '',
      ordering: guide.ordering ?? 0,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.content.trim()) {
      setFormError('Content is required.');
      return;
    }
    setFormError('');
    setIsConfirmSaveOpen(true);
  };

  const submitGuide = async () => {
    setIsSaving(true);
    try {
      const body = JSON.stringify({
        location: Number(form.location),
        title: form.title.trim() || undefined,
        content: form.content,
        ordering: Number(form.ordering),
      });

      const saved = editingGuide
        ? await apiFetch(ENDPOINTS.ADMIN.GUIDE(editingGuide.uuid), { method: 'PATCH', body })
        : await apiFetch(ENDPOINTS.ADMIN.GUIDES, { method: 'POST', body });

      setGuides((prev) =>
        editingGuide ? prev.map((g) => (g.uuid === saved.uuid ? saved : g)) : [saved, ...prev]
      );
      toast.success(editingGuide ? 'Guide updated.' : 'Guide created.');
      setIsConfirmSaveOpen(false);
      setIsFormOpen(false);
    } catch (err) {
      setIsConfirmSaveOpen(false);
      toast.error(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      await apiFetch(ENDPOINTS.ADMIN.GUIDE_ARCHIVE(archiveTarget.uuid), { method: 'PATCH' });
      setGuides((prev) => prev.filter((g) => g.uuid !== archiveTarget.uuid));
      toast.success('Guide archived.');
      setArchiveTarget(null);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Guides & Help Content</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">In-app help content shown on specific screens of the member app.</p>
        </div>
        <Button type="button" onClick={openCreate}>+ New Guide</Button>
      </div>

      <div className="flex flex-wrap gap-1.5 shrink-0">
        {[{ key: '', label: 'All' }, ...Object.entries(LOCATION_LABELS).map(([v, l]) => ({ key: v, label: l }))].map((f) => (
          <button
            key={f.key || 'all'}
            onClick={() => setLocationFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              locationFilter === f.key ? 'bg-[#762CFF] text-white' : 'bg-[#18112E] text-slate-400 border border-[#2B1F4A] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadGuides} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading guides...</p>
        ) : guides.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No guides in this view.</p>
        ) : (
          guides.map((guide) => (
            <div key={guide.uuid} className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate">{guide.title || '(untitled)'}</p>
                  <StatusBadge tone="info" showDot={false}>{LOCATION_LABELS[guide.location] || 'Unknown'}</StatusBadge>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(guide)}
                    className="px-3 py-1.5 bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveTarget(guide)}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg text-[11px] font-bold text-rose-300 transition-all cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 whitespace-pre-wrap">{guide.content?.replace(/<[^>]*>/g, ' ').trim() || '—'}</p>
            </div>
          ))
        )}
      </div>

      {/* ================= CREATE / EDIT GUIDE MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-sm font-bold text-white">{editingGuide ? 'Edit Guide' : 'New Guide'}</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Screen / Location</label>
                  <select
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: Number(e.target.value) })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    {Object.entries(LOCATION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ordering</label>
                  <input
                    type="number"
                    min="0"
                    value={form.ordering}
                    onChange={(e) => setForm({ ...form, ordering: e.target.value })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Title (optional)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Content (HTML)</label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="<p>Guide content...</p>"
                  className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF] font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Sanitized server-side; basic HTML tags are fine.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#231A3D]">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit">{editingGuide ? 'Save Changes' : 'Create Guide'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmSaveOpen}
        title={editingGuide ? 'Save guide changes?' : 'Create this guide?'}
        message={editingGuide ? 'The guide content will be updated.' : 'A new guide will be published to that screen.'}
        confirmLabel={editingGuide ? 'Save' : 'Create'}
        tone="primary"
        loading={isSaving}
        onConfirm={submitGuide}
        onCancel={() => setIsConfirmSaveOpen(false)}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive this guide?"
        message="It will no longer be shown on the member app."
        confirmLabel="Archive"
        tone="destructive"
        loading={isArchiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
