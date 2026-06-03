import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Image Gallery Modal
 *
 * Full-screen image viewer with:
 * - Clickable thumbnail grid
 * - Previous / Next arrows
 * - Small clickable previews below main image
 * - Keyboard navigation (left/right/escape)
 * - Dark overlay backdrop
 */
const ImageGalleryModal = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imgError, setImgError] = useState(false);

  const total = images?.length || 0;

  const goTo = useCallback(
    (index) => {
      if (index < 0) setCurrentIndex(total - 1);
      else if (index >= total) setCurrentIndex(0);
      else setCurrentIndex(index);
      setImgError(false);
    },
    [total],
  );

  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!total) return null;

  const currentImage = images[currentIndex];
  // Support both string URLs and { url, thumb, alt } objects
  const src = typeof currentImage === "string" ? currentImage : currentImage?.url || currentImage?.src;
  const alt = typeof currentImage === "string" ? `Image ${currentIndex + 1}` : currentImage?.alt || `Image ${currentIndex + 1}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40">
        <X className="h-6 w-6" />
      </button>

      <div className="flex h-full w-full flex-col items-center justify-center px-4 py-16">
        {/* Main image area */}
        <div className="relative flex w-full max-w-4xl flex-1 items-center justify-center">
          {/* Previous arrow */}
          {total > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40 md:-left-14"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* Main image */}
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl">
            {!imgError ? (
              <img src={src} alt={alt} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" onError={() => setImgError(true)} />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="text-sm">Image unavailable</div>
                </div>
              </div>
            )}
          </div>

          {/* Next arrow */}
          {total > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40 md:-right-14"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
        </div>

        {/* Counter */}
        {total > 1 && (
          <div className="mt-3 text-sm text-white/70">
            {currentIndex + 1} / {total}
          </div>
        )}

        {/* Small thumbnail strip */}
        {total > 1 && (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto px-2 pb-2">
            {images.map((img, idx) => {
              const thumbSrc = typeof img === "string" ? img : img?.thumb || img?.url || img?.src;
              const thumbAlt = typeof img === "string" ? `Thumb ${idx + 1}` : img?.alt || `Thumb ${idx + 1}`;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setImgError(false);
                  }}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    idx === currentIndex ? "border-amber-400 shadow-lg shadow-amber-400/30" : "border-white/30 hover:border-white/70"
                  }`}
                >
                  <img
                    src={thumbSrc}
                    alt={thumbAlt}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;
