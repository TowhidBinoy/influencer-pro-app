'use client';

import Cropper from 'react-easy-crop';

// The interactive crop/zoom stage for the Frame Editor.
//
// Layering is the whole trick: the frame image sits on top but is
// pointer-events-none, so every drag/pinch/scroll passes straight through
// it to react-easy-crop's media layer underneath. Visually the frame reads
// as fixed and "in front"; the member's own photo/video is what actually
// moves and scales inside it — never the other way around.
//
// While the member is actively interacting, the frame is dimmed so they can
// see what's hidden behind its opaque artwork; it snaps back to full
// opacity the instant they let go, so what they see at rest is what will
// actually render.
export default function MediaCropStage({
  mediaKind,
  mediaUrl,
  aspect,
  frameImage,
  frameName,
  cropState,
  setVideoRef,
  onMediaLoaded,
  mediaProps,
  children,
}) {
  const {
    crop, zoom, minZoom, maxZoom, isInteracting,
    setCrop, setZoom, onCropComplete,
    onInteractionStart, onInteractionEnd,
  } = cropState;

  return (
    <div
      className="mx-auto rounded-[20px] relative overflow-hidden bg-black shadow-2xl"
      style={{ aspectRatio: aspect, height: 'min(48vh, 480px)', maxWidth: '100%' }}
    >
      {mediaUrl && (
        <Cropper
          image={mediaKind === 'photo' ? mediaUrl : undefined}
          video={mediaKind === 'video' ? mediaUrl : undefined}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          minZoom={minZoom}
          maxZoom={maxZoom}
          // Default is "contain" (shows the whole media letterboxed, which
          // is why panning had nothing to reveal on whichever axis already
          // fit entirely) — "cover" is what makes zoom=1 always fill the
          // window edge to edge with no gaps, matching the crop-to-window
          // invariant the rest of this feature is built on.
          objectFit="cover"
          restrictPosition
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          // Cropper wires the video tag's own onLoadedMetadata to itself
          // internally and does not forward it through mediaProps — use
          // this (fires once natural size/duration are already available)
          // for anything that needs to know when the media has loaded.
          onMediaLoaded={onMediaLoaded}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          setVideoRef={setVideoRef}
          mediaProps={{ playsInline: true, loop: true, ...mediaProps }}
        />
      )}

      {frameImage && (
        <img
          src={frameImage}
          alt={frameName || ''}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-opacity duration-150"
          style={{ opacity: isInteracting ? 0.3 : 1 }}
        />
      )}

      {children}
    </div>
  );
}
