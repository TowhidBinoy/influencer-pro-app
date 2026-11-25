'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { FRAME_ASPECT_RATIO as ASPECT_LABELS, FRAME_ASPECT_RATIO_VALUE } from '../../../../lib/choices';
import CroppedMediaPreview from '../../../components/frame-editor/CroppedMediaPreview';

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

// render_status (§14c): 1 PROCESSING, 2 DONE, 3 FAILED.
const RENDER_DONE = 2;
const RENDER_FAILED = 3;

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000; // give the Celery/FFmpeg job a few minutes

function ExportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskUuid = searchParams.get('task_uuid');
  const memberJobUuid = searchParams.get('member_job_uuid');
  const jobUuid = searchParams.get('job_uuid');
  const frameUuid = searchParams.get('frame_uuid');

  const videoRef = useRef(null);
  const pollTimerRef = useRef(null);
  const pollDeadlineRef = useRef(0);
  const renderUuidRef = useRef(null);

  const [memberUuid, setMemberUuid] = useState(null);
  const [media, setMedia] = useState(null); // { file, url, kind }
  const [frame, setFrame] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);

  // Upload + server-side render lifecycle: 'idle' -> 'uploading' -> 'processing' -> 'done' | 'failed'
  const [renderState, setRenderState] = useState('idle');
  const [resultUrl, setResultUrl] = useState(null);

  const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' });

  useEffect(() => () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    const cachedUserStr = localStorage.getItem('imp_user');
    if (!token) { router.push('/login'); return; }
    if (!taskUuid || !jobUuid || !frameUuid) { router.push('/dashboard'); return; }

    const storedMedia = typeof window !== 'undefined' ? window.__frameEditorMedia : null;
    if (!storedMedia) {
      router.push(`/more/frame-editor/import?task_uuid=${taskUuid}&member_job_uuid=${memberJobUuid}`);
      return;
    }
    setMedia(storedMedia);

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }
    setMemberUuid(uuid);

    setIsLoading(true);
    apiFetch(ENDPOINTS.MEMBER.JOB_FRAME(uuid, jobUuid, frameUuid))
      .then(setFrame)
      .catch((err) => setLoadError(formatError(err)))
      .finally(() => setIsLoading(false));
  }, [router, taskUuid, memberJobUuid, jobUuid, frameUuid]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  // Poll GET /frame/{frame_uuid}/render/{uuid}/ until this render reaches
  // render_status DONE/FAILED. Rendering runs on a background worker
  // (Celery/FFmpeg) — see doc/API.md §14c.
  const pollForRenderResult = useCallback((renderUuid) => {
    pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;

    const tick = async () => {
      try {
        const render = await apiFetch(ENDPOINTS.MEMBER.FRAME_RENDER_ITEM(frameUuid, renderUuid));

        if (render?.render_status === RENDER_DONE) {
          setRenderState('done');
          setResultUrl(render.rendered_file);
          return;
        }
        if (render?.render_status === RENDER_FAILED) {
          setRenderState('failed');
          setSubmitMsg({ type: 'error', text: 'Rendering failed on the server. Please try again.' });
          return;
        }
      } catch {
        // transient poll error — keep trying until the deadline
      }

      if (Date.now() >= pollDeadlineRef.current) {
        setRenderState('failed');
        setSubmitMsg({ type: 'error', text: 'Rendering is taking longer than expected. Check back later or try again.' });
        return;
      }
      pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    };

    pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
  }, [frameUuid]);

  // Standalone Frame Editor render (§14c) — upload the raw file to
  // /frame/{frame_uuid}/render/; the server composites and queues the
  // output, returning the render row (render_status PROCESSING) immediately.
  const handleExport = async () => {
    if (!media?.file || !frameUuid) return;
    setSubmitMsg({ type: '', text: '' });
    setRenderState('uploading');
    try {
      const fd = new FormData();
      fd.append('file', media.file);
      // Crop rect is in the original file's own pixel space (from
      // react-easy-crop in select-frame), trim in seconds — matches
      // RenderRequestSerializer's crop_x/y/width/height and trim_in/out.
      if (media.crop) {
        fd.append('crop_x', String(Math.round(media.crop.x)));
        fd.append('crop_y', String(Math.round(media.crop.y)));
        fd.append('crop_width', String(Math.round(media.crop.width)));
        fd.append('crop_height', String(Math.round(media.crop.height)));
      }
      if (media.kind === 'video' && typeof media.trimIn === 'number') {
        fd.append('trim_in', String(media.trimIn));
        fd.append('trim_out', String(media.trimOut));
      }
      const render = await apiFetch(ENDPOINTS.MEMBER.FRAME_RENDER(frameUuid), { method: 'POST', body: fd });

      if (!render?.uuid) {
        setRenderState('failed');
        setSubmitMsg({ type: 'error', text: 'Upload succeeded but no render was queued. Please try again.' });
        return;
      }

      renderUuidRef.current = render.uuid;
      setRenderState('processing');
      pollForRenderResult(render.uuid);
    } catch (err) {
      setRenderState('idle');
      setSubmitMsg({ type: 'error', text: formatError(err) });
    }
  };

  // Download the composited file client-side — the Frame Editor is
  // standalone (doc/API.md §14c); submitting to a task is a separate step
  // done later through the ordinary content upload (§31).
  //
  // resultUrl is cross-origin (impb.kreatech.org), and browsers silently
  // ignore the `download` attribute on cross-origin <a> links — they just
  // navigate to the file instead of saving it. Fetching as a blob and
  // downloading from a same-origin blob: URL works regardless of origin;
  // /media/ sends Access-Control-Allow-Origin: * (doc/API.md §4, added 1.7)
  // so the fetch itself isn't blocked by CORS.
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const handleDownload = async () => {
    if (!resultUrl || isDownloading || hasDownloaded) return;
    setIsDownloading(true);
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = resultUrl.split('/').pop() || 'framed-export';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(resultUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
      setHasDownloaded(true);
      if (renderUuidRef.current) {
        apiFetch(ENDPOINTS.MEMBER.FRAME_RENDER_DOWNLOADED(frameUuid, renderUuidRef.current), { method: 'POST' }).catch(() => {});
      }
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
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">EXPORT YOUR {media?.kind === 'video' ? 'VIDEO' : 'PHOTO'}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 pl-6 font-normal">Preview your {media?.kind || 'media'} with the selected frame</p>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl">{loadError}</div>
        )}

        {submitMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            submitMsg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400' : 'bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55]'
          }`}>
            <span>{submitMsg.type === 'success' ? '✓' : '⚠️'}</span>
            <p>{submitMsg.text}</p>
          </div>
        )}

        <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-3.5 shadow-md flex flex-col items-center">
          <div
            className="mx-auto rounded-[22px] relative overflow-hidden shadow-2xl bg-black"
            style={{
              aspectRatio: FRAME_ASPECT_RATIO_VALUE[frame?.aspect_ratio] || 4 / 5,
              height: 'min(48vh, 480px)',
              maxWidth: '100%',
            }}
          >
            {renderState === 'done' && resultUrl ? (
              /\.(mp4|webm|mov)$/i.test(resultUrl) ? (
                <video src={resultUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img src={resultUrl} alt="Framed result" className="w-full h-full object-contain" />
              )
            ) : (renderState === 'uploading' || renderState === 'processing') ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2 px-6">
                <div className="w-8 h-8 border-2 border-[#B13CFF] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-white">
                  {renderState === 'uploading' ? 'Uploading...' : 'Rendering on server...'}
                </span>
                <span className="text-[10px] text-slate-400">This can take a little while for video or animated frames.</span>
              </div>
            ) : media?.url ? (
              <>
                {/* Replays the crop made in Select Frame — local preview
                    only, the real composite happens server-side on export
                    (§14c). */}
                <CroppedMediaPreview
                  mediaKind={media.kind}
                  mediaUrl={media.url}
                  croppedAreaPixels={media.crop}
                  naturalSize={media.naturalSize}
                  frameImage={frame?.image}
                  frameName={frame?.name}
                  videoRef={media.kind === 'video' ? videoRef : undefined}
                  mediaProps={media.kind === 'video' ? { onClick: togglePlay } : undefined}
                />
                {media.kind === 'video' && !isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label="Play"
                      className="pointer-events-auto w-12 h-12 rounded-full bg-[#120D22]/90 border border-white/30 flex items-center justify-center text-white pl-1 shadow-lg cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs">Loading preview...</div>
            )}
          </div>
        </div>

        <div className="bg-[#120D22] border border-[#231A3D] rounded-[20px] p-4 space-y-2 text-xs shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Media type</span>
            <span className="font-mono text-white font-bold capitalize">{media?.kind || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Frame</span>
            <span className="text-[#B13CFF] font-bold">{frame?.name || (isLoading ? 'Loading...' : '—')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Aspect ratio</span>
            <span className="text-white font-bold">{ASPECT_LABELS[frame?.aspect_ratio] || '—'}</span>
          </div>
          {renderState === 'done' && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Render status</span>
              <span className="text-emerald-400 font-bold">Done</span>
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-1">
          {renderState !== 'done' ? (
            <button
              type="button"
              disabled={renderState === 'uploading' || renderState === 'processing' || isLoading || !frame}
              onClick={handleExport}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold shadow-lg shadow-[#762CFF]/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {renderState === 'uploading' ? 'Uploading...' : renderState === 'processing' ? 'Rendering...' : `↓ Export ${media?.kind === 'video' ? 'Video' : 'Photo'}`}
            </button>
          ) : (
            <button
              type="button"
              disabled={isDownloading || hasDownloaded}
              onClick={handleDownload}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold shadow-lg shadow-[#762CFF]/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isDownloading ? 'Downloading...' : hasDownloaded ? '✓ Downloaded' : '↓ Download Export'}
            </button>
          )}

          <button
            type="button"
            disabled={renderState === 'uploading' || renderState === 'processing'}
            onClick={() => router.push(`/more/frame-editor/select-frame?task_uuid=${taskUuid}&member_job_uuid=${memberJobUuid}&job_uuid=${jobUuid}`)}
            className="w-full py-3 rounded-xl bg-[#120D22] hover:bg-[#1A1230] border border-[#231A3D] hover:border-[#762CFF] text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
          >
            ‹ Back to Editor
          </button>
        </div>

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function FrameEditorExportPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-[#07050E] text-white text-xs">Loading exporter...</div>}>
      <ExportContent />
    </Suspense>
  );
}
