'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import Button from '../../components/admin/ui/Button';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { useToast } from '../../components/admin/ui/Toast';
import BannersTable from '../../components/admin/banners/BannersTable';
import BannerForm from '../../components/admin/banners/BannerForm';

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

export default function BannersPage() {
  const toast = useToast();

  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.ADMIN.BANNERS}?page_size=100`);
      setBanners(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadBanners(); }, [loadBanners]);

  const openCreate = () => {
    setEditingBanner(null);
    setIsFormOpen(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (action, saved) => {
    setBanners((prev) =>
      action === 'update' ? prev.map((b) => (b.uuid === saved.uuid ? saved : b)) : [saved, ...prev]
    );
    toast.success(action === 'update' ? 'Banner updated.' : 'Banner created.');
    setIsFormOpen(false);
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      await apiFetch(ENDPOINTS.ADMIN.BANNER_ARCHIVE(archiveTarget.uuid), { method: 'PATCH' });
      setBanners((prev) => prev.filter((b) => b.uuid !== archiveTarget.uuid));
      toast.success('Banner archived.');
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
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Banners</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Promotional banners shown on the member app's home feed and campaigns tab.</p>
        </div>
        <Button type="button" onClick={openCreate}>+ New Banner</Button>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadBanners} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-400 text-center py-10">Loading banners...</p>
      ) : (
        <BannersTable banners={banners} onEdit={openEdit} onArchive={setArchiveTarget} />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto">
            <BannerForm
              banner={editingBanner}
              onClose={() => setIsFormOpen(false)}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive this banner?"
        message={`"${archiveTarget?.name}" will no longer be shown on the member app.`}
        confirmLabel="Archive"
        tone="destructive"
        loading={isArchiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
