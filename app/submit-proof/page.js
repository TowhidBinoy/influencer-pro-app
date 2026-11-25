'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import { apiFetch } from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints';
import { PLATFORM as PLATFORM_LABELS, CONTENT_TYPE as CONTENT_TYPE_LABELS } from '../../lib/choices';

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

function SubmitProofContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskUuid = searchParams.get('task_uuid');

  const [memberUuid, setMemberUuid] = useState(null);
  const [task, setTask] = useState(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);

  const [proofLink, setProofLink] = useState('');
  const [note, setNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadTask = useCallback(async (uuid, tUuid) => {
    setIsLoadingTask(true);
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.TASK(uuid, tUuid));
      setTask(data);
      setProofLink(data.proof_link || '');
      setNote(data.note || '');
    } catch (err) {
      setStatusMsg({ type: 'error', text: formatError(err) });
    } finally {
      setIsLoadingTask(false);
    }
  }, []);

  useEffect(() => {
    const cachedUserStr = localStorage.getItem('imp_user');
    const token = localStorage.getItem('imp_access_token');
    if (!token) { router.push('/login'); return; }
    if (!taskUuid) { router.push('/dashboard'); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }

    setMemberUuid(uuid);
    loadTask(uuid, taskUuid);
  }, [router, taskUuid, loadTask]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setStatusMsg({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!proofLink.trim() && !proofFile) {
      setStatusMsg({ type: 'error', text: 'Please provide a proof link or upload a screenshot.' });
      return;
    }
    if (!memberUuid || !taskUuid) return;

    setIsSubmitting(true);

    try {
      const isMultipart = !!proofFile;
      let body;
      if (isMultipart) {
        const fd = new FormData();
        if (proofLink.trim()) fd.append('proof_link', proofLink.trim());
        if (note.trim()) fd.append('note', note.trim());
        fd.append('proof_file', proofFile);
        body = fd;
      } else {
        body = JSON.stringify({
          proof_link: proofLink.trim(),
          note: note.trim() || undefined,
        });
      }

      await apiFetch(ENDPOINTS.MEMBER.TASK_SUBMIT(memberUuid, taskUuid), {
        method: task?.status === 2 ? 'PATCH' : 'POST',
        body,
      });

      setStatusMsg({ type: 'success', text: "Today's proof submitted successfully!" });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: formatError(err) });
    } finally {
      setIsSubmitting(false);
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
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-[#762CFF]/30"
            style={{ background: 'linear-gradient(135deg, #B13CFF 0%, #762CFF 100%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-wider text-white">INFLUENCER PRO</span>
        </div>

        <NotificationBell />
      </header>

      <main className="z-10 space-y-3.5 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">SUBMIT TODAY&apos;S PROOF</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8 font-normal">
            Submit proof for the selected job and today&apos;s date.
          </p>
        </div>

        {statusMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
              : 'bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55]'
          }`}>
            <span>{statusMsg.type === 'success' ? '✓' : '⚠️'}</span>
            <p>{statusMsg.text}</p>
          </div>
        )}

        <div className="bg-[#120D22] border border-[#231A3D] rounded-[20px] p-4">
          <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-0.5">JOB</p>
          <p className="text-sm font-bold text-white">
            {isLoadingTask ? 'Loading task...' : task ? `${task.org} · ${task.job_title}` : 'Task not found'}
          </p>
          {task && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              {task.quantity}x {CONTENT_TYPE_LABELS[task.content_type] || 'Post'} · {PLATFORM_LABELS[task.platform] || ''}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">PROOF DETAILS</p>

          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-1.5">
              Proof link
            </label>
            <input
              type="text"
              value={proofLink}
              onChange={(e) => setProofLink(e.target.value)}
              placeholder="https://instagram.com/reel/..."
              className="w-full bg-[#120D22] border border-[#231A3D] rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#762CFF] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-1.5">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the campaign team should know"
              className="w-full bg-[#120D22] border border-[#231A3D] rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#762CFF] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-1.5">
              Proof screenshot
            </label>
            <label className="w-full bg-[#120D22] border-2 border-dashed border-[#231A3D] hover:border-[#762CFF] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[90px] relative overflow-hidden group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {proofPreview ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-bold">✓ Screenshot Selected ({proofFile?.name?.slice(0, 18)}...)</span>
                  <span className="text-[10px] text-slate-400">(Click to change)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-300 group-hover:text-[#B13CFF] transition-colors flex items-center gap-1">
                    <span className="text-sm">+</span> Upload screenshot
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">A link or a screenshot is required</p>
                </>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !task}
            style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
            className="relative group overflow-hidden w-full text-white font-bold py-3.5 rounded-xl text-xs tracking-wider shadow-lg shadow-[#762CFF]/30 hover:shadow-[#B13CFF]/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 uppercase mt-2 cursor-pointer disabled:opacity-70 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>SUBMITTING PROOF...</span>
              </div>
            ) : (
              <span className="relative z-10">{task?.status === 2 ? 'UPDATE PROOF' : 'SUBMIT PROOF'}</span>
            )}
          </button>
        </form>

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function SubmitProofPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white text-xs">Loading...</div>}>
      <SubmitProofContent />
    </Suspense>
  );
}
