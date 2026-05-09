import { useEffect, useState } from "react";
import { Eye, FilePenLine, Languages, Plus } from "lucide-react";
import { articleService } from "@services/articleService";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { formatDate } from "@/utils/formatUtils";
import { toSafeNumber } from "@utils/bigint";

const stats = [
  { label: "Active campaigns", value: "12", icon: FilePenLine },
  { label: "Locale coverage", value: "VI / EN", icon: Languages },
  { label: "Total views", value: "24.3K", icon: Eye },
];

const BlogCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCampaigns = async () => {
      const data = await articleService.listCampaigns();

      if (mounted) {
        setCampaigns(data);
        setLoading(false);
      }
    };

    loadCampaigns();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="font-title text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">
                Current focus
              </div>
              <h1 className="font-title mt-3 text-3xl font-bold text-slate-950">
                Blog campaign management
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Track multilingual blog launches, review publishing status, and
                keep editorial momentum visible for the whole admin team.
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New campaign
            </Button>
          </div>
        </Card>

        <Card className="grid gap-3 p-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl bg-slate-950 px-4 py-4 text-white"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-title text-2xl font-bold">
                  {item.value}
                </div>
                <div className="mt-1 text-sm text-slate-300">{item.label}</div>
              </div>
            );
          })}
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="font-title text-xl font-bold text-slate-950">
              Campaign list
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Side-by-side locale publishing overview
            </div>
          </div>
          <Button variant="ghost">Refresh</Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <div>Title</div>
            <div>Locale</div>
            <div>Author</div>
            <div>Status</div>
            <div>Published</div>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-500">
              Loading campaigns...
            </div>
          ) : (
            campaigns.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-t border-slate-200 px-4 py-4 text-sm text-slate-600"
              >
                <div>
                  <div className="font-title text-base font-semibold text-slate-900">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {toSafeNumber(item.views).toLocaleString("en-US")} views
                  </div>
                </div>
                <div>{item.locale}</div>
                <div>{item.author}</div>
                <div>
                  <Badge>{item.status}</Badge>
                </div>
                <div>{formatDate(item.publishedAt)}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
};

export default BlogCampaignsPage;
