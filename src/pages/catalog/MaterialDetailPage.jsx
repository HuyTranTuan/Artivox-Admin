import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Layers, CalendarDays, User, DollarSign, PackageCheck } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { useTranslation } from "@hooks/useTranslation";
import { materialsService } from "@services/materialsService";
import ImageGalleryModal from "@components/ui/ImageGalleryModal";
import { formatDate } from "@utils/formatUtils";

const MaterialDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await materialsService.getMaterialBySlug(slug);
        if (mounted) setMaterial(data);
      } catch {
        if (mounted) setMaterial(null);
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
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-sm text-slate-500">{t("catalog.loading")}</div>
        </Card>
      </section>
    );
  }

  if (!material) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-sm text-slate-500">{t("catalog.noMaterials")}</div>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/catalog/materials")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg" onClick={() => navigate("/catalog/materials")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-title text-2xl font-bold text-slate-950">{material.name}</h1>
          <p className="text-sm text-slate-500 font-mono">{material.slug}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Layers className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold text-slate-900">{t("catalog.materialDetail")}</h2>
            </div>
          </div>

          {material.images && material.images.length > 0 ? (
            <div className="space-y-4">
              <div
                className="relative h-64 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group"
                onClick={() => {
                  setGalleryIndex(0);
                  setGalleryOpen(true);
                }}
              >
                <img
                  src={material.images[0].url}
                  alt={material.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition text-white font-semibold bg-black/50 rounded-lg px-4 py-2">
                    {t("catalog.viewAllImages", { count: material.images.length })}
                  </div>
                </div>
              </div>
              {material.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {material.images.map((img, idx) => (
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
            <div className="h-48 rounded-xl bg-slate-100 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Layers className="h-10 w-10 mx-auto mb-2" />
                <span className="text-xs">{t("catalog.noImages")}</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold text-slate-900">{t("catalog.info")}</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 uppercase">{t("catalog.name")}</div>
              <div className="text-sm font-medium text-slate-900 mt-1">{material.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">{t("catalog.type")}</div>
              <div className="text-sm text-slate-700 mt-1">{material.type || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">{t("catalog.status")}</div>
              <div className="mt-1">
                <Badge>{material.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 uppercase flex items-center gap-1">
                  <PackageCheck className="h-3 w-3" /> {t("catalog.stock")}
                </div>
                <div className="text-sm text-slate-700 mt-1">{material.stock ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> {t("catalog.price")}
                </div>
                <div className="text-sm text-slate-700 mt-1">{material.price ? `₫${Number(material.price).toLocaleString()}` : "—"}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {t("catalog.createdAt")}
              </div>
              <div className="text-sm text-slate-700 mt-1">{formatDate(material.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase flex items-center gap-1">
                <User className="h-3 w-3" /> {t("catalog.author")}
              </div>
              <div className="text-sm text-slate-700 mt-1">{material.author || "—"}</div>
            </div>
          </div>
          <Button className="w-full mt-6" variant="secondary" onClick={() => navigate("/catalog/materials")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("catalog.back")}
          </Button>
        </Card>
      </div>

      {galleryOpen && <ImageGalleryModal images={material.images || []} initialIndex={galleryIndex} onClose={() => setGalleryOpen(false)} />}
    </section>
  );
};

export default MaterialDetailPage;
