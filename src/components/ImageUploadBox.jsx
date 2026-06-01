import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

const ImageUploadBox = ({
  label,
  value,
  onClear,
  inputRef,
  onChange,
  recommended,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div
          onClick={() => inputRef.current?.click()}
          className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition overflow-hidden shrink-0 bg-slate-50"
        >
          {value?.preview ? (
            <img
              src={value.preview}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400">
                {t("catalog.upload")}
              </span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
        <div className="text-xs text-slate-400">
          <p className="font-medium text-slate-600">{label}</p>
          <p>{recommended}</p>
        </div>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-rose-500 hover:text-rose-700 text-xs font-semibold ml-auto"
          >
            {t("catalog.remove")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploadBox;
