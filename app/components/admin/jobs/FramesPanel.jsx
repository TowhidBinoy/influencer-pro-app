'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { FRAME_ASPECT_RATIO as ASPECT_LABELS, FRAME_MEDIA_TYPE as MEDIA_TYPE_LABELS } from '../../../../lib/choices';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import StatusBadge from '../ui/StatusBadge';

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

const EMPTY_FORM = { name: '', image: null, aspect_ratio: 1, media_type: 1, ordering: 0, status: 1 };

/**
 * Slide-over side panel for a job's overlay frames (doc/API.md §14).
 * Real API — a Frame is a name + a transparent PNG overlay image, not the
 * settings-page mock's color/text-badge concept.
 */
export default function FramesPanel({ org, job, onClose, toast }) {
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFrame, setEditingFrame] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const loadFrames = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.ADMIN.JOB_FRAMES(org.uuid, job.uuid)}?page_size=100`);
      setFrames(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, [org.uuid, job.uuid]);

  useEffect(() => { loadFrames(); }, [loadFrames]);

  const openCreate = () => {
    setEditingFrame(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (frame) => {
    setEditingFrame(frame);
    setForm({
      name: frame.name || '',
      image: null,
      aspect_ratio: frame.aspect_ratio,
      media_type: frame.media_type,
      ordering: frame.ordering ?? 0,
      status: frame.status,
    });
    setImagePreview(frame.image || null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Frame name is required.');
      return;
    }
    if (!editingFrame && !form.image) {
      setFormError('An overlay image (transparent PNG) is required.');
      return;
    }
    setFormError('');
    setIsConfirmSaveOpen(true);
  };

  const submitFrame = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('job_uuid', job.uuid);
      if (form.image) fd.append('image', form.image);
      fd.append('aspect_ratio', String(form.aspect_ratio));
      fd.append('media_type', String(form.media_type));
      fd.append('ordering', String(form.ordering));
      fd.append('status', String(form.status));

      const saved = editingFrame
        ? await apiFetch(ENDPOINTS.ADMIN.JOB_FRAME(org.uuid, job.uuid, editingFrame.uuid), { method: 'PATCH', body: fd })
        : await apiFetch(ENDPOINTS.ADMIN.JOB_FRAMES(org.uuid, job.uuid), { method: 'POST', body: fd });

      setFrames((prev) =>
        editingFrame ? prev.map((f) => (f.uuid === saved.uuid ? saved : f)) : [saved, ...prev]
      );
      toast.success(editingFrame ? 'Frame updated.' : 'Frame created.');
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
      await apiFetch(ENDPOINTS.ADMIN.JOB_FRAME_ARCHIVE(org.uuid, job.uuid, archiveTarget.uuid), { method: 'PATCH' });
      setFrames((prev) => prev.filter((f) => f.uuid !== archiveTarget.uuid));
      toast.success('Frame archived.');
      setArchiveTarget(null);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Side panel */}
      <div className="fixed inset-y-0 right-0 z-[10001] w-full sm:w-[440px] bg-[#120D22] border-l border-[#2B1F4A] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#231A3D] shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white">Overlay Frames</h3>
            <p className="text-[11px] text-slate-400 truncate">{job.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" size="sm" onClick={openCreate}>+ Add Frame</Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#18112E] text-slate-400 hover:text-white border border-[#2B1F4A] flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {loadError && (
            <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
              <span>{loadError}</span>
              <button onClick={loadFrames} className="underline shrink-0 cursor-pointer">Retry</button>
            </div>
          )}

          {isLoading ? (
            <p className="text-xs text-slate-400 text-center py-10">Loading frames...</p>
          ) : frames.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No frames on this job yet.</p>
          ) : (
            frames.map((frame) => (
              <div key={frame.uuid} className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-[#0E091C] border border-[#2B1F4A] shrink-0 overflow-hidden flex items-center justify-center">
                  {frame.image ? (
                    <img src={frame.image} alt={frame.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-600">No image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-white text-xs truncate">{frame.name}</p>
                    <StatusBadge tone={frame.status === 1 ? 'success' : 'neutral'}>
                      {frame.status === 1 ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {ASPECT_LABELS[frame.aspect_ratio] || '—'} · {MEDIA_TYPE_LABELS[frame.media_type] || '—'}
                    {frame.is_live && <span className="text-emerald-400 font-bold"> · LIVE</span>}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEdit(frame)}
                      className="text-[10px] font-bold text-[#B13CFF] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchiveTarget(frame)}
                      className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= CREATE / EDIT FRAME MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-sm font-bold text-white">{editingFrame ? 'Edit Frame' : 'New Frame'}</h3>
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
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. TikTok Border v1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Overlay Image (transparent PNG or GIF)</label>
                <input
                  type="file"
                  accept="image/png,image/gif"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2A1B4E] file:text-white hover:file:bg-[#762CFF] cursor-pointer mt-1"
                />
                {imagePreview && (
                  <div className="mt-2 w-20 h-20 rounded-xl bg-[#0E091C] border border-[#2B1F4A] overflow-hidden flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Aspect Ratio</label>
                  <select
                    value={form.aspect_ratio}
                    onChange={(e) => setForm({ ...form, aspect_ratio: Number(e.target.value) })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    {Object.entries(ASPECT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Media Type</label>
                  <select
                    value={form.media_type}
                    onChange={(e) => setForm({ ...form, media_type: Number(e.target.value) })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    {Object.entries(MEDIA_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ordering</label>
                  <input
                    type="number"
                    min="0"
                    value={form.ordering}
                    onChange={(e) => setForm({ ...form, ordering: Number(e.target.value) })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                    className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    <option value={1}>Active</option>
                    <option value={2}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#231A3D]">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit">{editingFrame ? 'Save Changes' : 'Create Frame'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmSaveOpen}
        title={editingFrame ? 'Save frame changes?' : 'Create this frame?'}
        message={editingFrame ? 'The overlay frame will be updated.' : 'A new overlay frame will be added to this job.'}
        confirmLabel={editingFrame ? 'Save' : 'Create'}
        tone="primary"
        loading={isSaving}
        onConfirm={submitFrame}
        onCancel={() => setIsConfirmSaveOpen(false)}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive this frame?"
        message={`"${archiveTarget?.name}" will be archived and removed from the job.`}
        confirmLabel="Archive"
        tone="destructive"
        loading={isArchiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </>
  );
}
