'use client';

import { Suspense, useState, useEffect } from 'react';
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

function SubmitContentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskUuid = searchParams.get('task_uuid');

  const [memberUuid, setMemberUuid] = useState(null);
  const [task, setTask] = useState(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

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

    apiFetch(ENDPOINTS.MEMBER.TASK(uuid, taskUuid))
      .then(setTask)
      .catch((err) => setStatusMsg({ type: 'error', text: formatError(err) }))
      .finally(() => setIsLoadingTask(false));
  }, [router, taskUuid]);

  // Handle Multi-file Upload Selection
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file, index) => {
        const isVideo = file.type.startsWith('video');
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        return {
          id: Date.now() + index,
          fileObject: file,
          name: file.name,
          size: `${sizeMb} MB`,
          type: isVideo ? 'Video' : 'Photo',
          status: 'Ready',
          icon: isVideo ? 'video' : 'photo',
        };
      });

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setStatusMsg({ type: '', text: '' });
    }
  };

  // Remove file from list
  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Handle Complete Content Submission — POST .../tasks/{uuid}/content/, multipart, 1-20 files
  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please upload at least one video or photo.' });
      return;
    }
    if (!memberUuid || !taskUuid) return;

    setIsSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      uploadedFiles.forEach((item) => {
        formData.append('files', item.fileObject);
      });

      await apiFetch(ENDPOINTS.MEMBER.TASK_CONTENT(memberUuid, taskUuid), {
        method: 'POST',
        body: formData,
      });

      setStatusMsg({ type: 'success', text: 'Content submitted successfully!' });
      setTimeout(() => {
        router.push('/more/job-board');
      }, 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: formatError(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">
      
      {/* Top Ambient Glow */}
      <div 
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      {/* 1. TOP APP HEADER */}
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

        {/* Notifications Icon */}
        <NotificationBell />
      </header>

      {/* 2. SCROLLABLE INNER CONTENT */}
      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">
        
        {/* Page Title & Subtitle */}
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
            <h1 className="text-xl font-black tracking-wider text-white uppercase">Submit Content Result</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8 font-normal">
            Upload your completed content for this job.
          </p>
        </div>

        {/* Status Message */}
        {statusMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400' 
              : 'bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55]'
          }`}>
            <span>{statusMsg.type === 'success' ? '✓' : '⚠️'}</span>
            <p>{statusMsg.text}</p>
          </div>
        )}

        {/* Job / Task Info Card */}
        <div className="bg-[#120D22] border border-[#231A3D] rounded-[20px] p-4 shadow-md">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">JOB</span>
          <span className="text-sm font-bold text-white mt-0.5 block">
            {isLoadingTask ? 'Loading task...' : task ? `${task.org} · ${task.job_title}` : 'Task not found'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Content Result Submission
          </span>
        </div>

        {/* Upload Box */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#B991FF] tracking-wider uppercase block">
            UPLOAD YOUR CONTENT
          </label>
          <label className="bg-[#120D22] border-2 border-dashed border-[#8B31FF]/50 hover:border-[#8B31FF] rounded-[22px] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group shadow-md relative overflow-hidden">
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#B13CFF] group-hover:scale-110 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B13CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-xs font-bold text-white mt-2 block">
              Upload Photo or Video
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Tap to browse or drag & drop
            </span>
            <span className="text-[9px] text-slate-500 mt-1 block uppercase">
              JPG, PNG, MP4, MOV • Max 200MB
            </span>
          </label>
        </div>

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-[#B991FF] tracking-wider uppercase block">
              UPLOADED FILES ({uploadedFiles.length})
            </label>

            <div className="space-y-2.5">
              {uploadedFiles.map((file) => (
                <div 
                  key={file.id}
                  className="bg-[#120D22] border border-[#231A3D] rounded-[20px] p-3.5 flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1C1435] border border-[#2C1F52] flex items-center justify-center shrink-0">
                      {file.icon === 'video' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#B13CFF">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B13CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-bold text-white block truncate max-w-[180px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {file.size} • {file.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                    <button 
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-slate-400 hover:text-[#FF2A55] text-xs font-bold p-1 cursor-pointer"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !task}
            style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
            className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-lg shadow-[#762CFF]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Content...</span>
              </>
            ) : (
              <span>Submit Content</span>
            )}
          </button>
        </div>

      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR */}
      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function SubmitContentResultPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white text-xs">Loading Form...</div>}>
      <SubmitContentResultContent />
    </Suspense>
  );
}