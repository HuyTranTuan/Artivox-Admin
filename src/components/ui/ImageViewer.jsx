import { useEffect, useRef, useState, useCallback } from "react";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@components/ui/button";

const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ImageViewer = ({ src, filename, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "=" || e.key === "+") {
        setScale((prev) => Math.min(prev + 0.25, 5));
      }
      if (e.key === "-") {
        setScale((prev) => Math.max(prev - 0.25, 0.25));
      }
      if (e.key === "0") resetView();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, resetView]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.25, Math.min(prev + delta, 5)));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.25));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80 truncate max-w-[300px]">{filename || "Image"}</span>
          <span className="text-xs text-white/50">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-full p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            disabled={scale <= 0.25}
          >
            <ZoomOut style={{ width: 20, height: 20 }} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-full p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
          >
            <span className="text-xs font-bold">{Math.round(scale * 100)}%</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-full p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            disabled={scale >= 5}
          >
            <ZoomIn style={{ width: 20, height: 20 }} />
          </Button>
          <div className="mx-1 h-5 w-px bg-white/20" />
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-full p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(src, filename || "image");
            }}
          >
            <Download style={{ width: 20, height: 20 }} />
          </Button>
          <div className="mx-1 h-5 w-px bg-white/20" />
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-full p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X style={{ width: 22, height: 22 }} />
          </Button>
        </div>
      </div>

      {/* Image */}
      <div ref={containerRef} className="flex items-center justify-center w-full h-full select-none" onWheel={handleWheel} onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={filename || "Preview"}
          className="max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-200 ease-out cursor-grab"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center px-4 py-3 bg-gradient-to-t from-black/50 to-transparent">
        <span className="text-xs text-white/60">Scroll to zoom • Drag to pan • ESC to close</span>
      </div>
    </div>
  );
};

export default ImageViewer;
