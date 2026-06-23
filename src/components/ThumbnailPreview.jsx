import { ImageIcon } from "lucide-react";

const ThumbnailPreview = ({ images, onClick }) => {
  if (!images || images.length === 0) {
    return (
      <div
        onClick={onClick}
        className="h-16 w-16 rounded-lg bg-(--color-secondary) flex items-center justify-center cursor-pointer hover:bg-slate-200 transition border border-slate-200"
      >
        <ImageIcon className="h-5 w-5 text-slate-400" />
      </div>
    );
  }
  const firstImg = images[0];
  const imgSrc =
    typeof firstImg === "string" ? firstImg : firstImg?.thumb || firstImg?.url;
  return (
    <div className="relative group" onClick={onClick}>
      <img
        src={imgSrc}
        alt="thumbnail"
        className="h-16 w-16 rounded-lg object-cover cursor-pointer border border-slate-200 hover:border-amber-300 transition hover:shadow-md"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      {images.length > 1 && (
        <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
          +{images.length - 1}
        </span>
      )}
    </div>
  );
};

export default ThumbnailPreview;
