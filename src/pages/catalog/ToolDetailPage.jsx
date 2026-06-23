import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Wrench,
  CalendarDays,
  User,
  DollarSign,
  PackageCheck,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { useTranslation } from "@hooks/useTranslation";
import { toolsService } from "@services/toolsService";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import { formatDate } from "@utils/formatUtils";
import Loading from "@/components/Loading";

const ToolDetailPage = () => {
  const { t } = useTranslation();

  const { slug } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await toolsService.getToolBySlug(slug);
        if (mounted) setTool(data);
      } catch {
        if (mounted) setTool(null);
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

  if (!tool) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-sm ">{t("catalog.noTools")}</div>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => navigate("/catalog/tools")}
          >
            <ArrowLeft className="h-5 w-5" />
            {t("catalog.back")}
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="h-9 w-9 p-0! rounded-lg hover:bg-(--color-primary) mr-1 cursor-pointer"
          onClick={() => navigate("/catalog/tools")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-title text-2xl font-bold ">{tool.name}</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-(--color-border) flex items-center justify-center">
              <Wrench className="h-5 w-5 " />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold ">
                {t("catalog.toolDetail")}
              </h2>
            </div>
          </div>

          {tool.images && tool.images.length > 0 ? (
            <div className="space-y-4">
              <div
                className="relative h-64 rounded-xl overflow-hidden bg-(--color-border) cursor-pointer group"
                onClick={() => {
                  setGalleryIndex(0);
                  setGalleryOpen(true);
                }}
              >
                <img
                  src={tool.images[0].url}
                  alt={tool.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <div className="opacity-30 group-hover:opacity-100 transition bg-(--color-border) rounded-lg px-4 py-2">
                    {t("catalog.viewAllImages", { count: tool.images.length })}
                  </div>
                </div>
              </div>
              {tool.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {tool.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.thumb || img.url}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-amber-500 transition shrink-0"
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
            <div className="h-48 rounded-lg bg-(--color-border) flex items-center justify-center">
              <div className="text-center">
                <Wrench className="h-10 w-10 mx-auto mb-2" />
                <span className="text-xs">{t("catalog.noImages")}</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-(--color-border) flex items-center justify-center">
              <Package className="h-5 w-5 " />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold ">
                {t("catalog.info")}
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs  uppercase">{t("catalog.name")}</div>
              <div className="text-sm font-medium  mt-1">{tool.name}</div>
            </div>
            <div>
              <div className="text-xs  uppercase">{t("catalog.category")}</div>
              <div className="text-sm  mt-1">{tool.category || ""}</div>
            </div>
            <div>
              <div className="text-xs   uppercase">{t("catalog.status")}</div>
              <div className="mt-1">
                <Badge>{tool.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs  uppercase flex items-center gap-1">
                  <PackageCheck className="h-3 w-3" /> {t("catalog.stock")}
                </div>
                <div className="text-sm  mt-1">{tool.stock ?? ""}</div>
              </div>
              <div>
                <div className="text-xs  uppercase flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> {t("catalog.price")}
                </div>
                <div className="text-sm  mt-1">
                  {tool.price
                    ? `${Number(tool.price).toLocaleString()} VNĐ`
                    : ""}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {t("catalog.createdAt")}
              </div>
              <div className="text-sm   mt-1">{formatDate(tool.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs  uppercase flex items-center gap-1">
                <User className="h-3 w-3" /> {t("catalog.author")}
              </div>
              <div className="text-sm mt-1">{tool.author || ""}</div>
            </div>
          </div>
        </Card>
      </div>

      {galleryOpen && (
        <ImageGalleryModal
          images={tool.images || []}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </section>
  );
};

export default ToolDetailPage;
