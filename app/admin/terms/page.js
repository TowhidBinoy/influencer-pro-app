'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { TERMS_CATEGORY as CATEGORY_LABELS } from '../../../lib/choices';
import Button from '../../components/admin/ui/Button';
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

/**
 * Terms & conditions (doc/API.md §23, /front-view/terms/). `category` is
 * unique per row and there are only 3 categories (lib/choices TERMS_CATEGORY),
 * so this models it as one editable row per category — create the row on
 * first save if it doesn't exist yet, PATCH it after. No archive action on
 * this model.
 */
export default function TermsPage() {
  const toast = useToast();

  const [terms, setTerms] = useState({}); // { [category]: termRow }
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editingCategory, setEditingCategory] = useState(null);
  const [contentDraft, setContentDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  const loadTerms = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.ADMIN.TERMS}?page_size=100`);
      const rows = Array.isArray(data?.results) ? data.results : [];
      const byCategory = {};
      rows.forEach((row) => { byCategory[row.category] = row; });
      setTerms(byCategory);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadTerms(); }, [loadTerms]);

  const openEdit = (category) => {
    setEditingCategory(category);
    setContentDraft(terms[category]?.content || '');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsConfirmSaveOpen(true);
  };

  const submitTerms = async () => {
    setIsSaving(true);
    try {
      const existing = terms[editingCategory];
      const saved = existing
        ? await apiFetch(ENDPOINTS.ADMIN.TERM(existing.uuid), {
            method: 'PATCH',
            body: JSON.stringify({ content: contentDraft }),
          })
        : await apiFetch(ENDPOINTS.ADMIN.TERMS, {
            method: 'POST',
            body: JSON.stringify({ category: Number(editingCategory), content: contentDraft }),
          });

      setTerms((prev) => ({ ...prev, [saved.category]: saved }));
      toast.success('Terms updated.');
      setIsConfirmSaveOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setIsConfirmSaveOpen(false);
      toast.error(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Terms & Conditions</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">One editable page per category, shown to members in the app.</p>
        </div>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadTerms} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10 sm:col-span-3">Loading terms...</p>
        ) : (
          Object.entries(CATEGORY_LABELS).map(([v, label]) => {
            const category = Number(v);
            const row = terms[category];
            return (
              <div key={category} className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 flex flex-col">
                <div>
                  <h3 className="text-sm font-bold text-white">{label}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{row?.modified ? `Last updated ${new Date(row.modified).toLocaleDateString()}` : 'Not published yet'}</p>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-4 flex-1 whitespace-pre-wrap">
                  {row?.content ? row.content.replace(/<[^>]*>/g, ' ').trim() : 'No content yet.'}
                </p>
                <Button type="button" size="sm" onClick={() => openEdit(category)}>
                  {row ? 'Edit' : 'Create'}
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* ================= EDIT TERMS MODAL ================= */}
      {editingCategory !== null && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-sm font-bold text-white">{CATEGORY_LABELS[editingCategory]} Terms</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Content (HTML)</label>
                <textarea
                  required
                  rows={14}
                  value={contentDraft}
                  onChange={(e) => setContentDraft(e.target.value)}
                  placeholder="<p>Terms content...</p>"
                  className="w-full bg-[#18112E] border border-[#2B1F4A] rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-[#762CFF] font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Sanitized server-side; basic HTML tags are fine.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#231A3D]">
                <Button type="button" variant="secondary" onClick={() => setEditingCategory(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmSaveOpen}
        title="Save terms changes?"
        message={editingCategory !== null ? `The ${CATEGORY_LABELS[editingCategory]} terms will be updated live for members.` : ''}
        confirmLabel="Save"
        tone="primary"
        loading={isSaving}
        onConfirm={submitTerms}
        onCancel={() => setIsConfirmSaveOpen(false)}
      />
    </div>
  );
}
