import { Upload } from "lucide-react";
import { useTranslation } from "@hooks/useTranslation";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

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
      <Label className="text-xs font-semibold mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-3">
        <div
          onClick={() => inputRef.current?.click()}
          className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition overflow-hidden shrink-0 bg-background"
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
          <Button
            variant="outline"
            onClick={onClear}
            className="text-(--color-secondary) hover:text-(--color-error) text-xs font-semibold ml-auto"
          >
            {t("catalog.remove")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUploadBox;
