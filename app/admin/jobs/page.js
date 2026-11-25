'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import {
  COMPANY_STATUS as ORG_STATUS_LABELS,
  JOB_STATUS as JOB_STATUS_LABELS,
  JOB_RECURRENCE as JOB_RECURRENCE_LABELS,
  PAYMENT_PERIOD as PAYMENT_PERIOD_LABELS,
  PLATFORM as PLATFORM_LABELS,
  CONTENT_TYPE as CONTENT_TYPE_LABELS,
  MEMBER_JOB_STATUS as MEMBER_JOB_STATUS_LABELS,
} from '../../../lib/choices';
import Button from '../../components/admin/ui/Button';
import FormField from '../../components/admin/ui/FormField';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { useToast } from '../../components/admin/ui/Toast';
import SubmissionsPanel from '../../components/admin/jobs/SubmissionsPanel';
import ResultsPanel from '../../components/admin/jobs/ResultsPanel';
import FramesPanel from '../../components/admin/jobs/FramesPanel';
import DateTimePicker from '../../components/admin/jobs/DateTimePicker';

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

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// <input type="datetime-local"> gives/takes a timezone-less "wall clock"
// string (e.g. "2026-08-31T03:23"), interpreted as the browser's local
// time. The API needs a real instant, so convert through Date, which
// parses/formats that string as local time on both ends.
function isoToDateTimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateTimeLocalToIso(value) {
  if (!value) return '';
  return new Date(value).toISOString();
}

const ORG_STATUS_TONE = { 1: 'success', 2: 'neutral' };
const JOB_STATUS_TONE = { 1: 'neutral', 2: 'success', 3: 'warning', 4: 'info' };
const MEMBER_JOB_STATUS_TONE = { 1: 'warning', 2: 'success', 3: 'info', 4: 'danger' };

const EMPTY_ORG_FORM = { name: '', telegram_link: '', status: 1, logo: null };
const EMPTY_JOB_FORM = {
  title: '', description: '', script: '', recurrence: 1, payment_amount: '', payment_period: 3,
  deduction_per_miss: '', start_date: '', end_date: '', status: 1,
};
const EMPTY_REQUIREMENT_FORM = { platform: 1, content_type: 1, quantity: 1 };

export default function JobsAdminPage() {
  const toast = useToast();

  // ---- Breadcrumb / drill-down state ----
  const [view, setView] = useState('orgs'); // 'orgs' | 'jobs' | 'members'
  const [activeOrg, setActiveOrg] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [jobTab, setJobTab] = useState('applicants'); // 'applicants' | 'submissions'

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">
      <Breadcrumbs
        view={view}
        activeOrg={activeOrg}
        activeJob={activeJob}
        onGoOrgs={() => { setView('orgs'); setActiveOrg(null); setActiveJob(null); }}
        onGoJobs={() => { setView('jobs'); setActiveJob(null); }}
      />

      {view === 'orgs' && (
        <OrgsView
          toast={toast}
          onOpenOrg={(org) => { setActiveOrg(org); setView('jobs'); }}
        />
      )}

      {view === 'jobs' && activeOrg && (
        <JobsView
          toast={toast}
          org={activeOrg}
          onOpenJob={(job) => { setActiveJob(job); setJobTab('applicants'); setView('members'); }}
        />
      )}

      {view === 'members' && activeOrg && activeJob && (
        <>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setJobTab('applicants')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                jobTab === 'applicants' ? 'bg-[#762CFF] text-white' : 'bg-[#18112E] text-slate-400 border border-[#2B1F4A] hover:text-white'
              }`}
            >
              Applicants
            </button>
            <button
              onClick={() => setJobTab('submissions')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                jobTab === 'submissions' ? 'bg-[#762CFF] text-white' : 'bg-[#18112E] text-slate-400 border border-[#2B1F4A] hover:text-white'
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => setJobTab('results')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                jobTab === 'results' ? 'bg-[#762CFF] text-white' : 'bg-[#18112E] text-slate-400 border border-[#2B1F4A] hover:text-white'
              }`}
            >
              Results
            </button>
          </div>

          {jobTab === 'applicants' && (
            <MembersView toast={toast} org={activeOrg} job={activeJob} />
          )}
          {jobTab === 'submissions' && (
            <SubmissionsPanel toast={toast} job={activeJob} />
          )}
          {jobTab === 'results' && (
            <ResultsPanel org={activeOrg} job={activeJob} />
          )}
        </>
      )}
    </div>
  );
}

function Breadcrumbs({ view, activeOrg, activeJob, onGoOrgs, onGoJobs }) {
  return (
    <div className="flex items-center gap-1.5 text-xs sm:text-sm shrink-0 flex-wrap">
      <button
        onClick={onGoOrgs}
        className={`font-bold transition-colors cursor-pointer ${view === 'orgs' ? 'text-white' : 'text-slate-400 hover:text-[#B13CFF]'}`}
      >
        Companies
      </button>
      {activeOrg && (
        <>
          <span className="text-slate-600">/</span>
          <button
            onClick={onGoJobs}
            className={`font-bold transition-colors cursor-pointer truncate max-w-[160px] sm:max-w-none ${view === 'jobs' ? 'text-white' : 'text-slate-400 hover:text-[#B13CFF]'}`}
          >
            {activeOrg.name}
          </button>
        </>
      )}
      {activeJob && (
        <>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white truncate max-w-[160px] sm:max-w-none">{activeJob.title}</span>
        </>
      )}
    </div>
  );
}

/* ============================================================
 * LEVEL 1 — COMPANIES (Orgs)
 * ============================================================ */
function OrgsView({ toast, onOpenOrg }) {
  const [orgs, setOrgs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_ORG_FORM);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  const loadOrgs = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.ADMIN.ORGS}?page_size=100`);
      setOrgs(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadOrgs(); }, [loadOrgs]);

  const openCreate = () => {
    setEditingOrg(null);
    setForm(EMPTY_ORG_FORM);
    setLogoPreview(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (org) => {
    setEditingOrg(org);
    setForm({ name: org.name || '', telegram_link: org.telegram_link || '', status: org.status, logo: null });
    setLogoPreview(org.logo || null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, logo: file }));
    setLogoPreview(file ? URL.createObjectURL(file) : (editingOrg?.logo || null));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Company name is required.');
      return;
    }
    setFormError('');
    setIsConfirmSaveOpen(true);
  };

  const submitOrg = async () => {
    setIsSaving(true);
    try {
      const isMultipart = !!form.logo;
      let body;
      if (isMultipart) {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        if (form.telegram_link.trim()) fd.append('telegram_link', form.telegram_link.trim());
        fd.append('status', String(form.status));
        fd.append('logo', form.logo);
        body = fd;
      } else {
        body = JSON.stringify({
          name: form.name.trim(),
          telegram_link: form.telegram_link.trim() || undefined,
          status: Number(form.status),
        });
      }

      const saved = editingOrg
        ? await apiFetch(ENDPOINTS.ADMIN.ORG(editingOrg.uuid), { method: 'PATCH', body })
        : await apiFetch(ENDPOINTS.ADMIN.ORGS, { method: 'POST', body });

      setOrgs((prev) => editingOrg
        ? prev.map((o) => (o.uuid === saved.uuid ? saved : o))
        : [saved, ...prev]);
      toast.success(editingOrg ? 'Company updated.' : 'Company created.');
      setIsConfirmSaveOpen(false);
      setIsFormOpen(false);
    } catch (err) {
      setIsConfirmSaveOpen(false);
      setFormError(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      const updated = await apiFetch(ENDPOINTS.ADMIN.ORG_ARCHIVE(archiveTarget.uuid), { method: 'PATCH' });
      setOrgs((prev) => prev.map((o) => (o.uuid === updated.uuid ? updated : o)));
      toast.success('Company archived.');
      setArchiveTarget(null);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Companies</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Brands running campaigns on the platform. Select one to manage its jobs.</p>
        </div>
        <Button onClick={openCreate} iconLeft={<span>+</span>}>New Company</Button>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadOrgs} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading companies...</p>
        ) : orgs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No companies yet. Create one to start posting jobs.</p>
        ) : (
          <>
            {/* MOBILE VIEW: Cards */}
            <div className="block sm:hidden space-y-3">
              {orgs.map((org) => (
                <div
                  key={org.uuid}
                  onClick={() => onOpenOrg(org)}
                  className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#762CFF] to-[#B13CFF] flex items-center justify-center overflow-hidden shrink-0">
                        {org.logo ? (
                          <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-black text-[10px]">{(org.name || '??').slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <p className="font-bold text-white text-xs leading-tight">{org.name}</p>
                    </div>
                    <StatusBadge tone={ORG_STATUS_TONE[org.status] || 'neutral'}>
                      {ORG_STATUS_LABELS[org.status] || 'Unknown'}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#231A3D]">
                    <p className="text-[11px] text-slate-400">{org.total_jobs ?? 0} jobs</p>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openEdit(org)}
                        className="px-3 py-1.5 bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setArchiveTarget(org)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg text-[11px] font-bold text-rose-300 transition-all cursor-pointer"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Company</th>
                    <th className="pb-3 px-3">Telegram</th>
                    <th className="pb-3 px-3">Total Jobs</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {orgs.map((org) => (
                    <tr
                      key={org.uuid}
                      onClick={() => onOpenOrg(org)}
                      className="hover:bg-[#1A1230]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#762CFF] to-[#B13CFF] flex items-center justify-center overflow-hidden shrink-0">
                            {org.logo ? (
                              <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-black text-[9px]">{(org.name || '??').slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="font-bold text-white">{org.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 truncate max-w-[220px]">{org.telegram_link || '—'}</td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono">{org.total_jobs ?? 0}</td>
                      <td className="py-3.5 px-3">
                        <StatusBadge tone={ORG_STATUS_TONE[org.status] || 'neutral'}>
                          {ORG_STATUS_LABELS[org.status] || 'Unknown'}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openEdit(org)}
                            className="px-3 py-1.5 bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchiveTarget(org)}
                            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg text-[11px] font-bold text-rose-300 transition-all cursor-pointer"
                          >
                            Archive
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

      {/* ================= CREATE / EDIT ORG MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-base font-bold text-white">{editingOrg ? 'Edit Company' : 'New Company'}</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-[#18112E] text-slate-400 hover:text-white border border-[#2B1F4A] flex items-center justify-center text-xs cursor-pointer"
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
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#18112E] border border-[#2B1F4A] flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-[10px]">No logo</span>
                  )}
                </div>
                <label className="text-xs font-semibold text-[#B13CFF] cursor-pointer hover:underline">
                  Upload logo
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>

              <FormField
                label="Company Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. KGAME99"
              />

              <FormField
                label="Telegram Link"
                value={form.telegram_link}
                onChange={(e) => setForm({ ...form, telegram_link: e.target.value })}
                placeholder="https://t.me/..."
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50 focus:border-[#9033FF]"
                >
                  {Object.entries(ORG_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" loading={isSaving}>{editingOrg ? 'Save Changes' : 'Create Company'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive company?"
        message={archiveTarget ? `${archiveTarget.name} will be deactivated. Its jobs will no longer be listed as live.` : ''}
        confirmLabel="Archive"
        tone="destructive"
        loading={isArchiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={isConfirmSaveOpen}
        title={editingOrg ? 'Save changes?' : 'Create this company?'}
        message={editingOrg ? `Update ${editingOrg.name}'s details.` : `${form.name.trim()} will be added as a new company.`}
        confirmLabel={editingOrg ? 'Save Changes' : 'Create Company'}
        tone="primary"
        loading={isSaving}
        onConfirm={submitOrg}
        onCancel={() => setIsConfirmSaveOpen(false)}
      />
    </>
  );
}

/* ============================================================
 * LEVEL 2 — JOBS (within a company)
 * ============================================================ */
function JobsView({ toast, org, onOpenJob }) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_JOB_FORM);
  const [requirements, setRequirements] = useState([]); // only used on create
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  const [framesJob, setFramesJob] = useState(null); // job whose Frames side panel is open, or null

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.ADMIN.JOBS(org.uuid)}?page_size=100`);
      setJobs(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, [org.uuid]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const openCreate = () => {
    setEditingJob(null);
    setForm(EMPTY_JOB_FORM);
    setRequirements([{ ...EMPTY_REQUIREMENT_FORM }]);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title || '',
      description: job.description || '',
      script: job.script || '',
      recurrence: job.recurrence,
      payment_amount: job.payment_amount ?? '',
      payment_period: job.payment_period,
      deduction_per_miss: job.deduction_per_miss ?? '',
      start_date: isoToDateTimeLocal(job.start_date),
      end_date: isoToDateTimeLocal(job.end_date),
      status: job.status,
    });
    setRequirements([]);
    setFormError('');
    setIsFormOpen(true);
  };

  const addRequirement = () => setRequirements((r) => [...r, { ...EMPTY_REQUIREMENT_FORM }]);
  const removeRequirement = (idx) => setRequirements((r) => r.filter((_, i) => i !== idx));
  const updateRequirement = (idx, field, value) =>
    setRequirements((r) => r.map((req, i) => (i === idx ? { ...req, [field]: value } : req)));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Job title is required.');
      return;
    }
    if (form.end_date && form.start_date && form.end_date < form.start_date) {
      setFormError('End date must be on or after the start date.');
      return;
    }
    setFormError('');
    setIsConfirmSaveOpen(true);
  };

  const submitJob = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        script: form.script.trim() || undefined,
        recurrence: Number(form.recurrence),
        payment_amount: form.payment_amount,
        payment_period: Number(form.payment_period),
        deduction_per_miss: form.deduction_per_miss === '' ? undefined : form.deduction_per_miss,
        start_date: dateTimeLocalToIso(form.start_date),
        end_date: form.end_date ? dateTimeLocalToIso(form.end_date) : undefined,
        status: Number(form.status),
      };

      if (!editingJob) {
        payload.requirements = requirements
          .filter((r) => r.platform && r.content_type)
          .map((r) => ({ platform: Number(r.platform), content_type: Number(r.content_type), quantity: Number(r.quantity) || 1 }));
      }

      const saved = editingJob
        ? await apiFetch(ENDPOINTS.ADMIN.JOB(org.uuid, editingJob.uuid), { method: 'PATCH', body: JSON.stringify(payload) })
        : await apiFetch(ENDPOINTS.ADMIN.JOBS(org.uuid), { method: 'POST', body: JSON.stringify(payload) });

      setJobs((prev) => editingJob
        ? prev.map((j) => (j.uuid === saved.uuid ? saved : j))
        : [saved, ...prev]);
      toast.success(editingJob ? 'Job updated.' : 'Job created.');
      setIsConfirmSaveOpen(false);
      setIsFormOpen(false);
    } catch (err) {
      setIsConfirmSaveOpen(false);
      setFormError(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      const updated = await apiFetch(ENDPOINTS.ADMIN.JOB_ARCHIVE(org.uuid, archiveTarget.uuid), { method: 'PATCH' });
      setJobs((prev) => prev.map((j) => (j.uuid === updated.uuid ? updated : j)));
      toast.success('Job archived.');
      setArchiveTarget(null);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Jobs · {org.name}</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Select a job to review its applicants.</p>
        </div>
        <Button onClick={openCreate} iconLeft={<span>+</span>}>New Job</Button>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadJobs} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No jobs for this company yet.</p>
        ) : (
          <>
            {/* MOBILE VIEW: Cards */}
            <div className="block sm:hidden space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.uuid}
                  onClick={() => onOpenJob(job)}
                  className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-white text-xs leading-tight">{job.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge tone={JOB_STATUS_TONE[job.status] || 'neutral'}>
                        {JOB_STATUS_LABELS[job.status] || 'Unknown'}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#231A3D]">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Reward</p>
                      <p className="text-[11px] font-bold text-emerald-400 font-mono mt-0.5">{formatAmount(job.payment_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Ends</p>
                      <p className="text-[11px] font-medium text-slate-200 mt-0.5">{formatDate(job.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openEdit(job)}
                      className="flex-1 py-2 bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setFramesJob(job)}
                      className="flex-1 py-2 bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Frames
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchiveTarget(job)}
                      className="flex-1 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-xl text-xs font-bold text-rose-300 transition-all cursor-pointer"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Job</th>
                    <th className="pb-3 px-3">Recurrence</th>
                    <th className="pb-3 px-3">Reward</th>
                    <th className="pb-3 px-3">Ends</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {jobs.map((job) => (
                    <tr
                      key={job.uuid}
                      onClick={() => onOpenJob(job)}
                      className="hover:bg-[#1A1230]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white">{job.title}</p>
                        {job.description && (
                          <p className="text-[10px] text-slate-500 truncate max-w-[260px]">{job.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {JOB_RECURRENCE_LABELS[job.recurrence] || '—'} · Paid {PAYMENT_PERIOD_LABELS[job.payment_period] || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-emerald-400 font-mono font-bold">{formatAmount(job.payment_amount)}</td>
                      <td className="py-3.5 px-3 text-slate-300">{formatDate(job.end_date)}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge tone={JOB_STATUS_TONE[job.status] || 'neutral'}>
                            {JOB_STATUS_LABELS[job.status] || 'Unknown'}
                          </StatusBadge>
                          {job.is_live && <StatusBadge tone="success" showDot={false}>LIVE</StatusBadge>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openEdit(job)}
                            className="px-3 py-1.5 bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setFramesJob(job)}
                            className="px-3 py-1.5 bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                          >
                            Frames
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchiveTarget(job)}
                            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg text-[11px] font-bold text-rose-300 transition-all cursor-pointer"
                          >
                            Archive
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

      {/* ================= CREATE / EDIT JOB MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="text-base font-bold text-white">{editingJob ? 'Edit Job' : 'New Job'} · {org.name}</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-[#18112E] text-slate-400 hover:text-white border border-[#2B1F4A] flex items-center justify-center text-xs cursor-pointer"
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
              <FormField
                label="Job Title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Daily Posting Challenge"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Guidelines and rules..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50 focus:border-[#9033FF] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Script</label>
                <textarea
                  rows={3}
                  maxLength={5000}
                  value={form.script}
                  onChange={(e) => setForm({ ...form, script: e.target.value })}
                  placeholder="Campaign talking points / sample caption shown to the member alongside the job's frames..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50 focus:border-[#9033FF] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Payment Amount (RM)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.payment_amount}
                  onChange={(e) => setForm({ ...form, payment_amount: e.target.value })}
                />
                <FormField
                  label="Deduction per Miss (RM)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.deduction_per_miss}
                  onChange={(e) => setForm({ ...form, deduction_per_miss: e.target.value })}
                  hint="Leave blank to use platform default"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Recurrence</label>
                  <select
                    value={form.recurrence}
                    onChange={(e) => setForm({ ...form, recurrence: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50 focus:border-[#9033FF]"
                  >
                    {Object.entries(JOB_RECURRENCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Payment Period</label>
                  <select
                    value={form.payment_period}
                    onChange={(e) => setForm({ ...form, payment_period: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50 focus:border-[#9033FF]"
                  >
                    {Object.entries(PAYMENT_PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50 focus:border-[#9033FF]"
                  >
                    {Object.entries(JOB_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField.Group label="Start Date" required>
                  <DateTimePicker
                    value={form.start_date}
                    onChange={(val) => setForm({ ...form, start_date: val })}
                  />
                </FormField.Group>
                <FormField.Group label="End Date">
                  <DateTimePicker
                    value={form.end_date}
                    onChange={(val) => setForm({ ...form, end_date: val })}
                    minDate={form.start_date}
                  />
                </FormField.Group>
              </div>

              {!editingJob && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-300">Content Requirements</label>
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="text-[11px] font-bold text-[#B13CFF] hover:underline cursor-pointer"
                    >
                      + Add requirement
                    </button>
                  </div>
                  {requirements.map((req, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-center">
                      <select
                        value={req.platform}
                        onChange={(e) => updateRequirement(idx, 'platform', e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
                      >
                        {Object.entries(PLATFORM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <select
                        value={req.content_type}
                        onChange={(e) => updateRequirement(idx, 'content_type', e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
                      >
                        {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={req.quantity}
                        onChange={(e) => updateRequirement(idx, 'quantity', e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirement(idx)}
                        disabled={requirements.length === 1}
                        className="w-8 h-8 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" loading={isSaving}>{editingJob ? 'Save Changes' : 'Create Job'}</Button>
              </div>
            </form>

            {editingJob && (
              <div className="pt-4 mt-4 border-t border-[#231A3D]">
                <RequirementsManager
                  toast={toast}
                  org={org}
                  job={editingJob}
                  onChange={(nextRequirements) => {
                    setJobs((prev) => prev.map((j) => (j.uuid === editingJob.uuid ? { ...j, requirements: nextRequirements } : j)));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive job?"
        message={archiveTarget ? `${archiveTarget.title} will no longer be listed as live for members.` : ''}
        confirmLabel="Archive"
        tone="destructive"
        loading={isArchiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={isConfirmSaveOpen}
        title={editingJob ? 'Save changes?' : 'Create this job?'}
        message={editingJob ? `Update "${editingJob.title}"'s details.` : `"${form.title.trim()}" will be created under ${org.name}.`}
        confirmLabel={editingJob ? 'Save Changes' : 'Create Job'}
        tone="primary"
        loading={isSaving}
        onConfirm={submitJob}
        onCancel={() => setIsConfirmSaveOpen(false)}
      />

      {framesJob && (
        <FramesPanel
          toast={toast}
          org={org}
          job={framesJob}
          onClose={() => setFramesJob(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------
 * Requirements manager — lives inside the Edit Job modal.
 * Each row is saved/archived immediately against its own
 * endpoint (doc §13), independent of the job's own Save button.
 * ------------------------------------------------------------ */
function RequirementsManager({ toast, org, job, onChange }) {
  const [items, setItems] = useState(() =>
    Array.isArray(job.requirements) ? job.requirements : []
  );
  const [savingId, setSavingId] = useState(null); // uuid | 'new' | null
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draft, setDraft] = useState(null); // { platform, content_type, quantity } | null
  const [saveTarget, setSaveTarget] = useState(null); // 'new' | uuid | null

  const notify = (next) => {
    setItems(next);
    onChange?.(next);
  };

  const startAdd = () => setDraft({ ...EMPTY_REQUIREMENT_FORM });

  const saveDraft = async () => {
    if (!draft) return false;
    setSavingId('new');
    try {
      const created = await apiFetch(ENDPOINTS.ADMIN.JOB_REQUIREMENTS(org.uuid, job.uuid), {
        method: 'POST',
        body: JSON.stringify({
          platform: Number(draft.platform),
          content_type: Number(draft.content_type),
          quantity: Number(draft.quantity) || 1,
        }),
      });
      notify([...items, created]);
      setDraft(null);
      toast.success('Requirement added.');
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const updateItem = async (uuid, field, value) => {
    const current = items.find((r) => r.uuid === uuid);
    if (!current) return;
    const next = { ...current, [field]: field === 'quantity' ? value : Number(value) };
    setItems((prev) => prev.map((r) => (r.uuid === uuid ? next : r)));
  };

  const commitItem = async (uuid) => {
    const current = items.find((r) => r.uuid === uuid);
    if (!current) return false;
    setSavingId(uuid);
    try {
      const updated = await apiFetch(ENDPOINTS.ADMIN.JOB_REQUIREMENT(org.uuid, job.uuid, uuid), {
        method: 'PATCH',
        body: JSON.stringify({
          platform: Number(current.platform),
          content_type: Number(current.content_type),
          quantity: Number(current.quantity) || 1,
        }),
      });
      const next = items.map((r) => (r.uuid === uuid ? updated : r));
      notify(next);
      toast.success('Requirement saved.');
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(ENDPOINTS.ADMIN.JOB_REQUIREMENT_ARCHIVE(org.uuid, job.uuid, deleteTarget.uuid), { method: 'PATCH' });
      const next = items.filter((r) => r.uuid !== deleteTarget.uuid);
      notify(next);
      toast.success('Requirement removed.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-300">Content Requirements</label>
        {!draft && (
          <button
            type="button"
            onClick={startAdd}
            className="text-[11px] font-bold text-[#B13CFF] hover:underline cursor-pointer"
          >
            + Add requirement
          </button>
        )}
      </div>

      {items.length === 0 && !draft && (
        <p className="text-[11px] text-slate-500">No content requirements yet.</p>
      )}

      {items.map((req) => (
        <div key={req.uuid} className="grid grid-cols-[1fr_1fr_70px_60px_32px] gap-2 items-center">
          <select
            value={req.platform}
            onChange={(e) => updateItem(req.uuid, 'platform', e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
          >
            {Object.entries(PLATFORM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={req.content_type}
            onChange={(e) => updateItem(req.uuid, 'content_type', e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
          >
            {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input
            type="number"
            min="1"
            value={req.quantity}
            onChange={(e) => updateItem(req.uuid, 'quantity', e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
          />
          <button
            type="button"
            onClick={() => setSaveTarget(req.uuid)}
            disabled={savingId === req.uuid}
            className="px-2 py-2 rounded-lg bg-[#1A1230] hover:bg-[#762CFF] border border-[#2F2154] hover:border-[#762CFF] text-white text-[11px] font-bold disabled:opacity-50 cursor-pointer"
          >
            {savingId === req.uuid ? '...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(req)}
            className="w-8 h-8 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}

      {draft && (
        <div className="grid grid-cols-[1fr_1fr_70px_60px_32px] gap-2 items-center">
          <select
            value={draft.platform}
            onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
          >
            {Object.entries(PLATFORM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={draft.content_type}
            onChange={(e) => setDraft({ ...draft, content_type: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
          >
            {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input
            type="number"
            min="1"
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9033FF]/50"
          />
          <button
            type="button"
            onClick={() => setSaveTarget('new')}
            disabled={savingId === 'new'}
            className="px-2 py-2 rounded-lg bg-[#762CFF] hover:bg-[#8B31FF] text-white text-[11px] font-bold disabled:opacity-50 cursor-pointer"
          >
            {savingId === 'new' ? '...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="w-8 h-8 rounded-lg bg-[#1A1230] hover:bg-[#231842] border border-[#2B1F4A] text-slate-300 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove requirement?"
        message="This content requirement will be archived and no longer counted toward the job."
        confirmLabel="Remove"
        tone="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!saveTarget}
        title={saveTarget === 'new' ? 'Add this requirement?' : 'Save requirement changes?'}
        message={saveTarget === 'new' ? 'A new content requirement will be added to this job.' : 'This content requirement will be updated.'}
        confirmLabel={saveTarget === 'new' ? 'Add' : 'Save'}
        tone="primary"
        loading={savingId === saveTarget}
        onConfirm={async () => {
          const ok = saveTarget === 'new' ? await saveDraft() : await commitItem(saveTarget);
          if (ok) setSaveTarget(null);
        }}
        onCancel={() => setSaveTarget(null)}
      />
    </div>
  );
}

/* ============================================================
 * LEVEL 3 — MEMBERS / APPLICANTS (within a job)
 * ============================================================ */
function MembersView({ toast, org, job }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [detailMember, setDetailMember] = useState(null); // member row shown in the detail popup, or null

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const qs = new URLSearchParams({ page_size: '100' });
      if (statusFilter) qs.set('status', statusFilter);
      const data = await apiFetch(`${ENDPOINTS.ADMIN.JOB_MEMBERS(org.uuid, job.uuid)}?${qs.toString()}`);
      setMembers(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, [org.uuid, job.uuid, statusFilter]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleUpdated = (updated) => {
    setMembers((prev) => prev.map((m) => (m.uuid === updated.uuid ? updated : m)));
    setDetailMember(updated);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Applicants · {job.title}</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Click a row to view details and approve or reject.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ key: '', label: 'All' }, ...Object.entries(MEMBER_JOB_STATUS_LABELS).map(([v, l]) => ({ key: v, label: l }))].map((f) => (
            <button
              key={f.key || 'all'}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === f.key ? 'bg-[#762CFF] text-white' : 'bg-[#18112E] text-slate-400 border border-[#2B1F4A] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={loadMembers} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading applicants...</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No applicants in this view.</p>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="block sm:hidden space-y-3">
              {members.map((m) => (
                <button
                  key={m.uuid}
                  type="button"
                  onClick={() => setDetailMember(m)}
                  className="w-full text-left bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-2 cursor-pointer hover:border-[#762CFF]/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white text-xs leading-tight">{m.member}</p>
                      <p className="text-[10px] text-slate-400">@{m.username}</p>
                    </div>
                    <StatusBadge tone={MEMBER_JOB_STATUS_TONE[m.status] || 'neutral'}>
                      {MEMBER_JOB_STATUS_LABELS[m.status] || 'Unknown'}
                    </StatusBadge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{m.affiliate_link || 'No affiliate link'}</p>
                </button>
              ))}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Member</th>
                    <th className="pb-3 px-3">Affiliate Link</th>
                    <th className="pb-3 px-3">Joined</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1438]">
                  {members.map((m) => (
                    <tr
                      key={m.uuid}
                      onClick={() => setDetailMember(m)}
                      className="hover:bg-[#1A1230]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white">{m.member}</p>
                        <p className="text-[#B13CFF] font-mono text-[10px]">@{m.username}</p>
                      </td>
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <span className="text-slate-400 truncate block max-w-full">{m.affiliate_link || '—'}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{formatDate(m.joined)}</td>
                      <td className="py-3.5 px-3">
                        <StatusBadge tone={MEMBER_JOB_STATUS_TONE[m.status] || 'neutral'}>
                          {MEMBER_JOB_STATUS_LABELS[m.status] || 'Unknown'}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {detailMember && (
        <MemberDetailModal
          toast={toast}
          orgUuid={org.uuid}
          jobUuid={job.uuid}
          member={detailMember}
          onClose={() => setDetailMember(null)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}

/**
 * Full-detail popup for one job applicant/member. Approve/Reject and the
 * affiliate-link edit all live here now — the list itself is click-only,
 * no inline action buttons.
 */
function MemberDetailModal({ toast, orgUuid, jobUuid, member, onClose, onUpdated }) {
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | null
  const [isActing, setIsActing] = useState(false);
  const [approveLink, setApproveLink] = useState(member.affiliate_link || '');

  const [linkValue, setLinkValue] = useState(member.affiliate_link || '');
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);

  const runAction = async () => {
    if (!actionType) return;
    setIsActing(true);
    try {
      const endpoint = actionType === 'approve'
        ? ENDPOINTS.ADMIN.JOB_MEMBER_APPROVE(orgUuid, jobUuid, member.uuid)
        : ENDPOINTS.ADMIN.JOB_MEMBER_REJECT(orgUuid, jobUuid, member.uuid);

      const body = actionType === 'approve' && approveLink.trim()
        ? JSON.stringify({ affiliate_link: approveLink.trim() })
        : undefined;

      const updated = await apiFetch(endpoint, { method: 'PATCH', body });
      onUpdated(updated);
      toast.success(actionType === 'approve' ? 'Application approved.' : 'Application rejected.');
      setActionType(null);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsActing(false);
    }
  };

  const saveLink = async () => {
    setIsSavingLink(true);
    try {
      const updated = await apiFetch(ENDPOINTS.ADMIN.JOB_MEMBER(orgUuid, jobUuid, member.uuid), {
        method: 'PATCH',
        body: JSON.stringify({ affiliate_link: linkValue.trim() || null }),
      });
      onUpdated(updated);
      toast.success('Affiliate link saved.');
      setIsEditingLink(false);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setIsSavingLink(false);
    }
  };

  const ACTION_COPY = {
    approve: { title: 'Approve application?', message: `${member.member} will be marked active on this job.`, confirmLabel: 'Approve', tone: 'primary' },
    reject: { title: 'Reject application?', message: `${member.member} will be rejected from this job.`, confirmLabel: 'Reject', tone: 'destructive' },
  };

  return (
    <>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-lg bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex items-start justify-between border-b border-[#231A3D] pb-4">
            <div>
              <h3 className="text-base font-bold text-white">{member.member}</h3>
              <p className="text-[11px] text-[#B13CFF] font-mono">@{member.username}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <StatusBadge tone={MEMBER_JOB_STATUS_TONE[member.status] || 'neutral'}>
              {MEMBER_JOB_STATUS_LABELS[member.status] || 'Unknown'}
            </StatusBadge>
          </div>

          <div className="bg-[#18112E] border border-[#281B45] rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Company</span><span className="text-white">{member.org || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Job</span><span className="text-white">{member.job_title || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Payment</span><span className="text-white">{formatAmount(member.payment_amount)} / {PAYMENT_PERIOD_LABELS[member.payment_period] || member.payment_period}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Recurrence</span><span className="text-white">{JOB_RECURRENCE_LABELS[member.recurrence] || member.recurrence || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Has Frames</span><span className="text-white">{member.has_frames ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Applied</span><span className="text-white">{formatDate(member.created)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Joined</span><span className="text-white">{formatDate(member.joined)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Completed</span><span className="text-white">{formatDate(member.completed)}</span></div>
          </div>

          <div className="bg-[#18112E] border border-[#281B45] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Affiliate Link</span>
              {!isEditingLink && (
                <button
                  type="button"
                  onClick={() => { setLinkValue(member.affiliate_link || ''); setIsEditingLink(true); }}
                  className="text-[10px] font-bold text-[#B13CFF] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingLink ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setIsEditingLink(false)}>Cancel</Button>
                  <Button type="button" size="sm" loading={isSavingLink} onClick={saveLink}>Save</Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white break-all">{member.affiliate_link || 'Not set'}</p>
            )}
          </div>

          {member.status === 1 ? (
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="destructive" onClick={() => { setApproveLink(member.affiliate_link || ''); setActionType('reject'); }}>
                Reject
              </Button>
              <Button type="button" onClick={() => { setApproveLink(member.affiliate_link || ''); setActionType('approve'); }}>
                Approve
              </Button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 text-right">No actions available for this status.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!actionType}
        title={actionType ? ACTION_COPY[actionType].title : ''}
        message={actionType ? ACTION_COPY[actionType].message : ''}
        confirmLabel={actionType ? ACTION_COPY[actionType].confirmLabel : ''}
        tone={actionType ? ACTION_COPY[actionType].tone : 'primary'}
        loading={isActing}
        onConfirm={runAction}
        onCancel={() => setActionType(null)}
        preview={actionType === 'approve' ? (
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
    </>
  );
}
