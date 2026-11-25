// lib/cropMath.js
// Pure helper shared by the Frame Editor's crop stage (interactive, via
// react-easy-crop) and its export preview (static). Both need to turn a
// react-easy-crop `croppedAreaPixels` result — always expressed in the
// original media's natural pixel space — into a plain absolute-position
// style that reproduces the same crop on a bare <img>/<video>, so what the
// member sees on Export matches what they cropped in Select Frame.

export function getCroppedMediaStyle(croppedAreaPixels, naturalWidth, naturalHeight) {
  if (!croppedAreaPixels || !naturalWidth || !naturalHeight) return null;

  const { x, y, width, height } = croppedAreaPixels;
  if (!width || !height) return null;

  // Scale is expressed per-axis, as "% of container per source pixel" —
  // the container's width IS croppedAreaPixels.width source-pixels wide
  // (and likewise for height), so this holds regardless of the container's
  // own on-screen pixel size.
  const scaleXPct = 100 / width;
  const scaleYPct = 100 / height;

  return {
    position: 'absolute',
    left: `${-x * scaleXPct}%`,
    top: `${-y * scaleYPct}%`,
    width: `${naturalWidth * scaleXPct}%`,
    height: `${naturalHeight * scaleYPct}%`,
    maxWidth: 'none',
    maxHeight: 'none',
  };
}
