'use client';

import { getCroppedMediaStyle } from '../../../lib/cropMath';

// Static, non-interactive replay of the crop the member made in Select
// Frame (see MediaCropStage), used on the Export screen. Not a Cropper —
// there's nothing left to adjust here, it just has to visually match what
// will actually be composited server-side, using the same
// croppedAreaPixels react-easy-crop produced there.
export default function CroppedMediaPreview({
  mediaKind,
  mediaUrl,
  croppedAreaPixels,
  naturalSize,
  frameImage,
  frameName,
  videoRef,
  mediaProps,
}) {
  const mediaStyle = getCroppedMediaStyle(
    croppedAreaPixels, naturalSize?.width, naturalSize?.height,
  ) || { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {mediaKind === 'video' ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          playsInline
          loop
          crossOrigin="anonymous"
          style={mediaStyle}
          {...mediaProps}
        />
      ) : (
        <img src={mediaUrl} alt="Your upload" style={mediaStyle} />
      )}

      {frameImage && (
        <img
          src={frameImage}
          alt={frameName || ''}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
        />
      )}
    </div>
  );
}
