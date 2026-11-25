'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { PLATFORM as PLATFORM_LABELS, CONTENT_TYPE as CONTENT_TYPE_LABELS, SUBMISSION_STATUS as STATUS_LABELS } from '../../../../lib/choices';

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
  return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

function JobOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskUuid = searchParams.get('task_uuid');

  const [memberUuid, setMemberUuid] = useState(null);
  const [task, setTask] = useState(null);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultForm, setResultForm] = useState({ views: '', likes: '', comments: '', shares: '' });
  const [metricsFile, setMetricsFile] = useState(null);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultError, setResultError] = useState('');

  const genericScript = `🔥 Hey guys! Check out today's campaign — post consistently and keep your affiliate link in bio!\nDon't miss the daily posting window! #InfluencerPro`;

  const loadTask = useCallback(async (uuid, tUuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.TASK(uuid, tUuid));
      setTask(data);

      // Task has no job_uuid of its own (doc/API.md §31) — resolve it via
      // MY_JOBS (§29, MemberJob object, §16) to fetch the full Job object
      // (§12), which is where the admin-authored `script` field lives.
      try {
        const myJobs = await apiFetch(ENDPOINTS.MEMBER.MY_JOBS(uuid));
        const rows = Array.isArray(myJobs?.results) ? myJobs.results : (Array.isArray(myJobs) ? myJobs : []);
        const memberJob = rows.find((mj) => mj.uuid === data.member_job_uuid);
        if (memberJob?.job_uuid) {
          const jobData = await apiFetch(ENDPOINTS.MEMBER.AVAILABLE_JOB(uuid, memberJob.job_uuid));
          setJob(jobData);
        }
      } catch {
        // script is a nice-to-have here — fall back to the generic script below
      }
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    const cachedUserStr = localStorage.getItem('imp_user');
    if (!token) { router.push('/login'); return; }
    if (!taskUuid) { router.push('/dashboard'); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }

    setMemberUuid(uuid);
    loadTask(uuid, taskUuid);
  }, [router, taskUuid, loadTask]);

  const activeScript = job?.script || genericScript;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(activeScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openResultModal = () => {
    setResultForm({
      views: task?.views ?? '',
      likes: task?.likes ?? '',
      comments: task?.comments ?? '',
      shares: task?.shares ?? '',
    });
    setMetricsFile(null);
    setResultError('');
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    const hasAnyField = ['views', 'likes', 'comments', 'shares'].some((k) => resultForm[k] !== '') || metricsFile;
    if (!hasAnyField) {
      setResultError('Enter at least one metric or upload a screenshot.');
      return;
    }
    setResultError('');
    setIsSavingResult(true);
    try {
      const isMultipart = !!metricsFile;
      let body;
      if (isMultipart) {
        const fd = new FormData();
        ['views', 'likes', 'comments', 'shares'].forEach((k) => {
          if (resultForm[k] !== '') fd.append(k, resultForm[k]);
        });
        fd.append('metrics_screenshot', metricsFile);
        body = fd;
      } else {
        const payload = {};
        ['views', 'likes', 'comments', 'shares'].forEach((k) => {
          if (resultForm[k] !== '') payload[k] = Number(resultForm[k]);
        });
        body = JSON.stringify(payload);
      }

      const updated = await apiFetch(ENDPOINTS.MEMBER.TASK_RESULT(memberUuid, taskUuid), {
        method: task?.has_result ? 'PATCH' : 'POST',
        body,
      });
      setTask(updated);
      setIsResultModalOpen(false);
    } catch (err) {
      setResultError(formatError(err));
    } finally {
      setIsSavingResult(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">

      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      <header className="flex items-center justify-between px-5 pt-6 pb-2 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.back()} className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="font-bold text-base tracking-wider text-white">INFLUENCER PRO</span>
        </div>

        <NotificationBell />
      </header>

      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        <div>
          <h1 className="text-xl font-black tracking-wider text-white uppercase">Job Overview</h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">View everything you need before completing today&apos;s task.</p>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadTask(memberUuid, taskUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading task...</p>
          </div>
        ) : task ? (
          <>
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#B991FF] tracking-wider uppercase">ACTIVE JOB</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {STATUS_LABELS[task.status] || 'Pending'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">{task.org}</h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">{task.job_title}</p>
                <p className="text-[10px] text-slate-400 font-normal mt-1">{formatDate(task.period_key)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-[#B991FF] tracking-wider uppercase">TODAY&apos;S TASK</h3>
              <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">{task.quantity}x {CONTENT_TYPE_LABELS[task.content_type] || 'Post'}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{PLATFORM_LABELS[task.platform] || ''} · Required</span>
                  </div>
                  <div className="flex flex-col items-center">
                    {task.status === 1 ? (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-400/80 border-t-transparent animate-spin mb-1" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black text-[10px] font-bold mb-1">✓</div>
                    )}
                    <span className="text-[9px] font-black text-amber-400 tracking-wider">{STATUS_LABELS[task.status] || 'PENDING'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-[#B991FF] tracking-wider uppercase">CONTENT</h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setIsScriptModalOpen(true)}
                  className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1A1230] border border-[#2B1F4A] flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-[#B13CFF] transition-colors block leading-tight">Script</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block leading-none">{job?.script ? 'Campaign instructions' : 'Sample caption'}</span>
                    </div>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
                </div>

                <Link
                  href={`/more/frame-editor?task_uuid=${task.uuid}&member_job_uuid=${task.member_job_uuid}`}
                  className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1A1230] border border-[#2B1F4A] flex items-center justify-center text-[#B13CFF] shrink-0 group-hover:scale-105 transition-transform">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-[#B13CFF] transition-colors block leading-tight">Frame</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block leading-none">Open Frame Editor</span>
                    </div>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
                </Link>
              </div>
            </div>

            {task.status >= 2 && (
              <div
                onClick={openResultModal}
                className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1A1230] border border-[#2B1F4A] flex items-center justify-center text-[#63C7FF] shrink-0 group-hover:scale-105 transition-transform">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#63C7FF] transition-colors block leading-tight">
                      {task.has_result ? 'Update Results' : 'Report Results'}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block leading-none">Views, likes, comments, shares</span>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <Link
                href={`/submit-proof?task_uuid=${task.uuid}`}
                style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
                className="w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white shadow-lg shadow-[#762CFF]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center block"
              >
                {task.status === 2 ? 'Update Proof' : 'Submit Proof'}
              </Link>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Task not found.</p>
          </div>
        )}

      </main>

      {isScriptModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">📜</span>
                <h3 className="font-bold text-white text-sm">{job?.script ? 'Campaign Script' : 'Sample Caption'}</h3>
              </div>
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-[#18112E] border border-[#281B45] rounded-2xl text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {activeScript}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyScript}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isCopied ? '✓ Copied to Clipboard!' : 'Copy Script Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isResultModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 shadow-2xl space-y-4 relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#63C7FF]">📊</span>
                <h3 className="font-bold text-white text-sm">Post Performance</h3>
              </div>
              <button
                onClick={() => setIsResultModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Display only — reporting your post's performance does not affect earnings.
            </p>

            {resultError && (
              <div className="p-2.5 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-[11px] font-semibold rounded-xl">
                {resultError}
              </div>
            )}

            <form onSubmit={handleSaveResult} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'views', label: 'Views' },
                  { key: 'likes', label: 'Likes' },
                  { key: 'comments', label: 'Comments' },
                  { key: 'shares', label: 'Shares' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{f.label}</label>
                    <input
                      type="number"
                      min="0"
                      value={resultForm[f.key]}
                      onChange={(e) => setResultForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-[#18112E] border border-[#281B45] focus:border-[#762CFF] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Metrics Screenshot (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMetricsFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2A1B4E] file:text-white hover:file:bg-[#762CFF] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingResult}
                className="w-full py-2.5 bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-70"
              >
                {isSavingResult ? 'Saving...' : 'Save Results'}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function JobOverviewPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white text-xs">Loading Overview...</div>}>
      <JobOverviewContent />
    </Suspense>
  );
}
