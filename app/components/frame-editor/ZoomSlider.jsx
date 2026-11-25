'use client';

// Explicit zoom control for the Frame Editor's crop stage. Cropper already
// handles pinch (touch) and scroll (desktop) zoom on its own, but this
// gives every device a visible, discoverable way to zoom in — and doubles
// as the only way to zoom on a trackpad-less desktop without a wheel event.
export default function ZoomSlider({ zoom, minZoom, maxZoom, onChange }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="text-slate-400 text-xs font-bold select-none">−</span>
      <input
        type="range"
        min={minZoom}
        max={maxZoom}
        step={0.01}
        value={zoom}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-[#231A3D] rounded-full accent-[#B13CFF] cursor-pointer"
        aria-label="Zoom"
      />
      <span className="text-slate-400 text-xs font-bold select-none">+</span>
    </div>
  );
}
