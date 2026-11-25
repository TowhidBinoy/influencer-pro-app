'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { FRAME_ASPECT_RATIO_VALUE } from '../../../../lib/choices';
import { useMediaCrop } from '../../../hooks/useMediaCrop';
import MediaCropStage from '../../../components/frame-editor/MediaCropStage';
import ZoomSlider from '../../../components/frame-editor/ZoomSlider';
import VideoTrimBar from '../../../components/frame-editor/VideoTrimBar';

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

function SelectFrameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskUuid = searchParams.get('task_uuid');
  const memberJobUuid = searchParams.get('member_job_uuid');
  const jobUuid = searchParams.get('job_uuid');

  const videoElRef = useRef(null);
  const [memberUuid, setMemberUuid] = useState(null);
  const [media, setMedia] = useState(null); // { file, url, kind }

  const [frames, setFrames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trim, setTrim] = useState({ trimIn: 0, trimOut: 0 });

  // Crop/zoom session for whichever media the member uploaded — see
  // MediaCropStage for how it's wired to the frame overlay on top. Needs
  // the window's aspect to work out how far zoom-out is allowed to go
  // (down to the whole asset being visible, never further).
  const aspectValue = FRAME_ASPECT_RATIO_VALUE[selectedFrame?.aspect_ratio] || 4 / 5;
  const cropState = useMediaCrop(aspectValue);

  // Switching frames can change the window's aspect ratio, so a crop chosen
  // for the previous frame may no longer make sense — start fresh.
  useEffect(() => {
    cropState.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrame?.aspect_ratio]);

  const loadFrames = useCallback(async (uuid, jUuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.MEMBER.JOB_FRAMES(uuid, jUuid)}?page_size=100`);
      const rows = Array.isArray(data?.results) ? data.results : [];
      setFrames(rows);
      setSelectedFrame(rows[0] || null);
      if (rows.length === 0) setLoadError('No frames are available on this job yet.');
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
    if (!taskUuid || !memberJobUuid || !jobUuid) { router.push('/dashboard'); return; }

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
    loadFrames(uuid, jobUuid);
  }, [router, taskUuid, memberJobUuid, jobUuid, loadFrames]);

  // Playback is driven through Cropper's own <video> element (exposed via
  // setVideoRef on MediaCropStage) — there's no separate <video> here.
  const togglePlay = () => {
    if (videoElRef.current && media?.kind === 'video') {
      if (isPlaying) videoElRef.current.pause();
      else videoElRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  // Cropper doesn't forward the video tag's onLoadedMetadata (it reserves
  // that for itself — see the comment in MediaCropStage), so duration is
  // read here instead, off Cropper's own onMediaLoaded — by the time that
  // fires the native event has already happened and setVideoRef has
  // already populated videoElRef, so the duration is there to read.
  const handleMediaLoaded = (mediaSize) => {
    cropState.onMediaLoaded(mediaSize);
    if (media?.kind === 'video' && videoElRef.current) {
      const d = videoElRef.current.duration || 0;
      setDuration(d);
      setTrim({ trimIn: 0, trimOut: d });
    }
  };

  const handleTimeUpdate = () => {
    if (videoElRef.current) setCurrentTime(videoElRef.current.currentTime);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const goToFrame = (offset) => {
    if (frames.length === 0) return;
    const currentIndex = Math.max(0, frames.findIndex((f) => f.uuid === selectedFrame?.uuid));
    const nextIndex = (currentIndex + offset + frames.length) % frames.length;
    setSelectedFrame(frames[nextIndex]);
  };

  // Carries the crop/trim the member settled on here forward to Export —
  // see doc note in FRAME-EDITOR-NOTES.md on the transform contract.
  const handleApplyFrame = () => {
    if (!selectedFrame) return;
    if (typeof window !== 'undefined' && window.__frameEditorMedia) {
      window.__frameEditorMedia = {
        ...window.__frameEditorMedia,
        crop: cropState.croppedAreaPixels,
        naturalSize: cropState.naturalSize,
        ...(media?.kind === 'video' ? trim : {}),
      };
    }
    const qs = new URLSearchParams({
      task_uuid: taskUuid,
      member_job_uuid: memberJobUuid,
      job_uuid: jobUuid,
      frame_uuid: selectedFrame.uuid,
    });
    router.push(`/more/frame-editor/export?${qs.toString()}`);
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

      <main className="z-10 space-y-3.5 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">SELECT A FRAME</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 pl-6 font-normal">Choose a frame to overlay on your {media?.kind || 'media'}</p>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            {frames.length === 0 && (
              <button onClick={() => loadFrames(memberUuid, jobUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
            )}
          </div>
        )}

        <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-3 shadow-md space-y-2.5">
          {media?.url ? (
            <MediaCropStage
              mediaKind={media.kind}
              mediaUrl={media.url}
              aspect={aspectValue}
              frameImage={selectedFrame?.image}
              frameName={selectedFrame?.name}
              cropState={cropState}
              setVideoRef={(ref) => { videoElRef.current = ref.current; }}
              onMediaLoaded={handleMediaLoaded}
              mediaProps={media.kind === 'video' ? {
                onTimeUpdate: handleTimeUpdate,
              } : undefined}
            >
              {media.kind === 'video' && !isPlaying && (
                // pointer-events-none on the wrapper (not inset-0 as a
                // button) so pausing never blocks panning/zooming the
                // frame underneath — only the visible circle is clickable.
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

              {frames.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goToFrame(-1)}
                    aria-label="Previous frame"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-[#120D22]/80 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-[#1D1438] transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => goToFrame(1)}
                    aria-label="Next frame"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-[#120D22]/80 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-[#1D1438] transition-colors"
                  >
                    ›
                  </button>
                </>
              )}
            </MediaCropStage>
          ) : (
            <div className="mx-auto rounded-[20px] bg-black flex flex-col items-center justify-center text-center space-y-1 p-10" style={{ aspectRatio: aspectValue, height: 'min(48vh, 480px)', maxWidth: '100%' }}>
              <span className="text-base font-black text-white tracking-widest uppercase block">MEDIA</span>
              <span className="text-[11px] text-slate-400 font-medium">Preview unavailable</span>
            </div>
          )}

          {frames.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {frames.map((f) => (
                <button
                  key={f.uuid}
                  type="button"
                  onClick={() => setSelectedFrame(f)}
                  aria-label={`Go to frame ${f.name}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    selectedFrame?.uuid === f.uuid ? 'w-5 bg-[#B13CFF]' : 'w-1.5 bg-[#2B1F4A] hover:bg-[#3A2A5E]'
                  }`}
                />
              ))}
            </div>
          )}

          <ZoomSlider
            zoom={cropState.zoom}
            minZoom={cropState.minZoom}
            maxZoom={cropState.maxZoom}
            onChange={cropState.setZoom}
          />

          {media?.kind === 'video' && (
            <>
              <div className="flex items-center gap-3 px-1">
                <button onClick={togglePlay} className="text-white text-xs hover:text-[#B13CFF] transition-colors p-1 cursor-pointer font-bold">
                  {isPlaying ? '❚❚' : '▶'}
                </button>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{formatTime(currentTime)} / {formatTime(duration)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 15}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => { if (videoElRef.current) { videoElRef.current.currentTime = Number(e.target.value); setCurrentTime(Number(e.target.value)); } }}
                  className="flex-1 h-1.5 bg-[#231A3D] rounded-full accent-[#B13CFF] cursor-pointer"
                />
              </div>

              <VideoTrimBar
                duration={duration}
                trimIn={trim.trimIn}
                trimOut={trim.trimOut}
                onChange={setTrim}
              />
            </>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading frames...</p>
          </div>
        ) : frames.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-white tracking-wide">Available Frames</h3>
              <span className="text-[10px] text-slate-400">Select frame style</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {frames.map((frame) => {
                const isSelected = selectedFrame?.uuid === frame.uuid;
                return (
                  <button
                    key={frame.uuid}
                    type="button"
                    onClick={() => setSelectedFrame(frame)}
                    className={`w-full aspect-[3/4] bg-[#120D22] rounded-[18px] border-2 transition-all p-1.5 flex flex-col justify-between cursor-pointer border-[#2B1F4A] ${
                      isSelected ? 'ring-2 ring-[#B13CFF] ring-offset-2 ring-offset-[#0A0618] scale-105 shadow-lg bg-[#1D1438]' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-full bg-[#1A1230] rounded-[12px] flex flex-col items-center justify-center p-1 text-center overflow-hidden">
                      {frame.image ? (
                        <img src={frame.image} alt={frame.name} crossOrigin="anonymous" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300 leading-tight">{frame.name}</span>
                      )}
                      {isSelected && <span className="text-[10px] font-black text-emerald-400 mt-1">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedFrame}
            onClick={handleApplyFrame}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold shadow-lg shadow-[#762CFF]/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            Apply Frame & Preview Export ➔
          </button>
        </div>

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function FrameEditorSelectFramePage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-[#07050E] text-white text-xs">Loading frame editor...</div>}>
      <SelectFrameContent />
    </Suspense>
  );
}
