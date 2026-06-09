import { useTranslate } from "@/i18n/useTranslate";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Eye } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { collectionService } from "@services/collectionService";
import Loading from "@/components/Loading";

const CollectionDetailPage = () => {
  const { t } = useTranslate();

  const { slug } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await collectionService.getCollectionBySlug(slug);
        if (mounted) setCollection(data);
      } catch {
        if (mounted) setCollection(null);
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

  if (!collection) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-sm text-slate-500">{t('collectionNotFound')}</div>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => navigate("/catalog/collections")}
          >{t('backToCollections')}</Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="h-10 w-10 p-0! rounded-lg"
          onClick={() => navigate("/catalog/collections")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-title text-2xl font-bold">{collection.name}</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Info Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold text-slate-900">{t('catalog.collectionInfo')}</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 uppercase">{t('catalog.name')}</div>
              <div className="text-sm font-medium text-slate-900 mt-1">
                {collection.name}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">{t('articles.slug')}</div>
              <div className="text-sm font-mono text-slate-700 mt-1">
                {collection.slug}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">{t('catalog.description')}</div>
              <div className="text-sm text-slate-700 mt-1">
                {collection.description || "—"}
              </div>
            </div>
            {collection.status && (
              <div>
                <div className="text-xs text-slate-500 uppercase">{t('articles.status')}</div>
                <div className="mt-1">
                  <Badge>{collection.status}</Badge>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Products in this collection */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Eye className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold text-slate-900">{t('catalog.products')}</h2>
              <p className="text-xs text-slate-500">
                {collection.products?.length || 0} items
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500 border-b border-slate-300">
              <div>{t('catalog.product')}</div>
              <div>{t('catalog.type')}</div>
              <div>{t('catalog.price')}</div>
            </div>
            {(collection.products || []).length === 0 ? (
              <div className="px-4 py-8 text-sm text-slate-500 text-center">{t('catalog.noProducts')}</div>
            ) : (
              collection.products.map((product) => (
                <div
                  key={product.id || product.slug}
                  className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  <div className="font-medium text-slate-900">
                    {product.name}
                  </div>
                  <div>{product.type}</div>
                  <div>
                    {product.price
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)
                      : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CollectionDetailPage;
