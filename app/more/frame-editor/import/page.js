'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';

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

function ImportMediaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberJobUuid = searchParams.get('member_job_uuid');

  const fileInputRef = useRef(null);
  const [memberUuid, setMemberUuid] = useState(null);
  const [jobUuid, setJobUuid] = useState(null);
  const [jobLabel, setJobLabel] = useState('');
  const [taskUuid, setTaskUuid] = useState(searchParams.get('task_uuid'));
  const [isResolvingJob, setIsResolvingJob] = useState(true);
  const [resolveError, setResolveError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaKind, setMediaKind] = useState(null); // 'video' | 'photo'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // task_uuid may arrive already known (deep-linked from job-overview) or
  // not (arriving from the standalone job picker) — TASKS_TODAY (§31)
  // creates today's task rows on demand, so it doubles as the resolver here.
  const resolveJob = useCallback(async (uuid, mjUuid, knownTaskUuid) => {
    setIsResolvingJob(true);
    setResolveError('');
    try {
      const [myJobsData, todaysTasks] = await Promise.all([
        apiFetch(`${ENDPOINTS.MEMBER.MY_JOBS(uuid)}?page_size=100`),
        knownTaskUuid ? Promise.resolve(null) : apiFetch(ENDPOINTS.MEMBER.TASKS_TODAY(uuid)),
      ]);
      const rows = Array.isArray(myJobsData?.results) ? myJobsData.results : [];
      const match = rows.find((r) => r.uuid === mjUuid);
      if (!match) {
        setResolveError('This job could not be found.');
        return;
      }
      setJobUuid(match.job_uuid);
      setJobLabel(`${match.org} · ${match.job_title}`);

      if (!knownTaskUuid) {
        const taskRows = Array.isArray(todaysTasks) ? todaysTasks : [];
        const task = taskRows.find((t) => t.member_job_uuid === mjUuid);
        if (!task) {
          setResolveError("Today's task for this job could not be found.");
          return;
        }
        setTaskUuid(task.uuid);
      }
    } catch (err) {
      setResolveError(formatError(err));
    } finally {
      setIsResolvingJob(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    const cachedUserStr = localStorage.getItem('imp_user');
    if (!token) { router.push('/login'); return; }
    if (!memberJobUuid) { router.push('/more/frame-editor/select-job'); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }

    setMemberUuid(uuid);
    resolveJob(uuid, memberJobUuid, searchParams.get('task_uuid'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, memberJobUuid, resolveJob]);

  const processFile = (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      alert('Please upload a valid photo or video file.');
      return;
    }
    setSelectedFile(file);
    setMediaKind(isVideo ? 'video' : 'photo');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleContinue = () => {
    if (!selectedFile) {
      alert('Please upload a photo or video first.');
      return;
    }
    if (typeof window !== 'undefined') {
      window.__frameEditorMedia = { file: selectedFile, url: previewUrl, kind: mediaKind };
    }
    const qs = new URLSearchParams({ task_uuid: taskUuid, member_job_uuid: memberJobUuid, job_uuid: jobUuid || '' });
    router.push(`/more/frame-editor/select-frame?${qs.toString()}`);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">

      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      <header className="flex items-center justify-between px-5 pt-6 pb-2 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-[#762CFF]/30"
            style={{ background: 'linear-gradient(135deg, #B13CFF 0%, #762CFF 100%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-wider text-white">INFLUENCER PRO</span>
        </div>

        <NotificationBell />
      </header>

      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">IMPORT YOUR MEDIA</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 pl-6 font-normal">
            {isResolvingJob ? 'Loading job...' : jobLabel ? `Upload a photo or video for ${jobLabel}.` : 'Upload a photo or video to apply the frame.'}
          </p>
        </div>

        {resolveError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{resolveError}</span>
            <button onClick={() => resolveJob(memberUuid, memberJobUuid, searchParams.get('task_uuid'))} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          className={`bg-[#120D22] border-2 border-dashed rounded-[28px] p-6 text-center cursor-pointer transition-all shadow-md group flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden ${
            isDragOver ? 'border-[#B13CFF] bg-[#1E1238]' : 'border-[#312256] hover:border-[#762CFF]'
          }`}
        >
          {previewUrl ? (
            <div className="w-full h-full max-h-[240px] flex items-center justify-center relative">
              {mediaKind === 'video' ? (
                <video src={previewUrl} playsInline muted loop autoPlay className="w-full h-full max-h-[240px] object-contain rounded-2xl bg-black" />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full h-full max-h-[240px] object-contain rounded-2xl bg-black" />
              )}
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1A1230] border border-[#2F2052] flex items-center justify-center text-slate-300 group-hover:text-[#B13CFF] group-hover:scale-110 group-hover:border-[#762CFF] transition-all shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-[#B13CFF] transition-colors">
                  Tap to upload a photo or video
                </p>
                <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, MP4, MOV (Recommended 9:16 vertical)</p>
              </div>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <span className="text-[#B13CFF] font-bold">{mediaKind === 'video' ? '📹' : '🖼️'}</span>
              <span className="text-white font-medium truncate">{selectedFile.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setPreviewUrl(null);
                setMediaKind(null);
              }}
              className="text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={!previewUrl || isResolvingJob || !jobUuid || !taskUuid}
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold shadow-lg shadow-[#762CFF]/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Continue to Frame Selection ➔</span>
          </button>
        </div>

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function FrameEditorImportPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-[#07050E] text-white text-xs">Loading importer...</div>}>
      <ImportMediaContent />
    </Suspense>
  );
}
