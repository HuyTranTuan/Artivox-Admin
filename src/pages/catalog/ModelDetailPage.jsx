import useTranslation from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Eye, Box, CalendarDays, User } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { modelsService } from "@services/modelsService";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import { formatDate } from "@utils/formatUtils";
import Loading from "@/components/Loading";

const ModelDetailPage = () => {
  const { t } = useTranslation();

  const { slug } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await modelsService.getModelBySlug(slug);
        if (mounted) setModel(data);
      } catch {
        if (mounted) setModel(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return <Loading text={false} height={"20"} width={"20"} />;
  }

  if (!model) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-sm">{t("catalog.noModels")}</div>
          <Button
            variant="outline"
            className="mt-4 cursor-pointer p-0! rounded-xl"
            onClick={() => navigate("/catalog/models")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("catalog.back")}
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="h-10 w-10 p-0! rounded-xl cursor-pointer hover:bg-(--color-primary)"
          onClick={() => navigate("/catalog/models")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-title text-2xl font-bold">{model.name}</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Image Gallery */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold">
                {t("catalog.modelDetail")}
              </h2>
            </div>
          </div>

          {model.images && model.images.length > 0 ? (
            <div className="space-y-4">
              <div
                className="relative h-64 rounded-xl overflow-hidden cursor-pointer group bg-(--color-border)"
                onClick={() => {
                  setGalleryIndex(0);
                  setGalleryOpen(true);
                }}
              >
                <img
                  src={model.images[0].url}
                  alt={model.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 transition flex items-center justify-center">
                  <div className="opacity-30 group-hover:opacity-100 transition rounded-xl px-4 py-2">
                    {t("catalog.viewAllImages", { count: model.images.length })}
                  </div>
                </div>
              </div>
              {model.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {model.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.thumb || img.url}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover cursor-pointer border-2 border-transparent hover:border-(--color-primary) transition shrink-0"
                      onClick={() => {
                        setGalleryIndex(idx);
                        setGalleryOpen(true);
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Eye className="h-10 w-10 p-0! mx-auto mb-2" />
                <span className="text-xs">{t("catalog.noImages")}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold">
                {t("catalog.info")}
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase flex items-center gap-1">
                <Package className="h-3 w-3" /> {t("catalog.name")}
              </div>
              <div className="text-sm font-medium mt-1">{model.name}</div>
            </div>
            <div>
              <div className="text-xs uppercase">{t("catalog.category")}</div>
              <div className="text-sm mt-1">{model.category || ""}</div>
            </div>
            <div>
              <div className="text-xs uppercase">{t("catalog.status")}</div>
              <div className="mt-1">
                <Badge>{model.status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {t("catalog.createdAt")}
              </div>
              <div className="text-sm mt-1">{formatDate(model.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs uppercase flex items-center gap-1">
                <User className="h-3 w-3" /> {t("catalog.author")}
              </div>
              <div className="text-sm mt-1">{model.author?.email || ""}</div>
            </div>
          </div>
        </Card>
      </div>

      {galleryOpen && (
        <ImageGalleryModal
          images={model.images || []}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </section>
  );
};

export default ModelDetailPage;
