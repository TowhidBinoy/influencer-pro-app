'use client';

import { useCallback, useMemo, useState } from 'react';

const MAX_ZOOM = 3;

// A flat floor under the "whole asset visible" ratio below, so there's
// always a lot of room to shrink the asset well past just "fully visible"
// — even when its aspect already roughly matches the window's, which
// would otherwise put "whole asset visible" right around 1 (~no zoom-out
// range at all).
const ABSOLUTE_MIN_ZOOM = 0.1;

// Drives one react-easy-crop session for the Frame Editor: crop position,
// zoom, the resulting crop rect in source-pixel space, and an interaction
// flag so the frame overlay can dim while the member is actively
// dragging/pinching/scrolling (see MediaCropStage).
//
// `aspect` is the crop window's width/height ratio. zoom=1 is react-easy-
// crop's own "cover" fit (fills the window edge to edge, no gaps). minZoom
// is the smaller of two things: ABSOLUTE_MIN_ZOOM (always available), and
// how far out "contain" fit (whole asset visible, letterboxed) sits for
// this particular asset/window pairing — so a badly mismatched aspect can
// still zoom out further than the flat floor if that's where full
// visibility happens to land.
export function useMediaCrop(aspect) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoomState] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [naturalSize, setNaturalSize] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const minZoom = useMemo(() => {
    if (!naturalSize?.width || !naturalSize?.height || !aspect) return ABSOLUTE_MIN_ZOOM;
    const mediaAspect = naturalSize.width / naturalSize.height;
    // Ratio of "contain" scale to "cover" scale — always <= 1, and exactly
    // 1 only when the media's aspect already matches the window's.
    const containRatio = Math.min(mediaAspect / aspect, aspect / mediaAspect);
    return Math.min(containRatio, ABSOLUTE_MIN_ZOOM);
  }, [naturalSize, aspect]);

  const setZoom = useCallback((value) => {
    setZoomState(Math.max(minZoom, Math.min(MAX_ZOOM, value)));
  }, [minZoom]);

  const onCropComplete = useCallback((_croppedArea, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const onMediaLoaded = useCallback((mediaSize) => {
    setNaturalSize({ width: mediaSize.naturalWidth, height: mediaSize.naturalHeight });
  }, []);

  const onInteractionStart = useCallback(() => setIsInteracting(true), []);
  const onInteractionEnd = useCallback(() => setIsInteracting(false), []);

  const reset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    // Always safe: minZoom is <= 1 by construction, so 1 (full cover) is
    // always a valid starting point, regardless of the media/window aspect.
    setZoomState(1);
    setCroppedAreaPixels(null);
  }, []);

  return {
    crop,
    zoom,
    minZoom,
    maxZoom: MAX_ZOOM,
    isInteracting,
    croppedAreaPixels,
    naturalSize,
    setCrop,
    setZoom,
    onCropComplete,
    onMediaLoaded,
    onInteractionStart,
    onInteractionEnd,
    reset,
  };
}
