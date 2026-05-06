import { useEffect, useState } from "react";
import {
  Eye,
  FilePenLine,
  Languages,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { articleService } from "@services/articleService";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { formatDate } from "@utils/formatDate";
import { toSafeNumber } from "@utils/bigint";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";

const stats = [
  { label: "Active campaigns", value: "12", icon: FilePenLine },
  { label: "Locale coverage", value: "VI / EN", icon: Languages },
  { label: "Total views", value: "24.3K", icon: Eye },
];

const ArticleCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));

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

  const handleView = (item) => {
    setSelectedItem(item);
    setOpenDialog("view");
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenDialog("edit");
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setOpenDialog("delete");
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      // Call API to delete
      setCampaigns(campaigns.filter((c) => c.id !== selectedItem.id));
      setOpenDialog(null);
      setSelectedItem(null);
    }
  };

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
                Article campaign management
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Track multilingual article launches, review publishing status,
                and keep editorial momentum visible for the whole admin team.
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
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500 border-b border-slate-300">
            <div>Title</div>
            <div>Locale</div>
            <div>Author</div>
            <div>Status</div>
            <div>Published</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-500">
              Loading campaigns...
            </div>
          ) : (
            campaigns.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600"
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                    onClick={() => handleView(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dialogs */}
        {openDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div
              ref={dialogRef}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
            >
              {openDialog === "view" && (
                <>
                  <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                    View Campaign
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 uppercase">
                        Title
                      </div>
                      <div className="text-sm text-slate-900">
                        {selectedItem?.title}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase">
                        Author
                      </div>
                      <div className="text-sm text-slate-900">
                        {selectedItem?.author}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase">
                        Status
                      </div>
                      <Badge>{selectedItem?.status}</Badge>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase">
                        Views
                      </div>
                      <div className="text-sm text-slate-900">
                        {toSafeNumber(selectedItem?.views).toLocaleString(
                          "en-US",
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6"
                    onClick={() => setOpenDialog(null)}
                  >
                    Close
                  </Button>
                </>
              )}

              {openDialog === "edit" && (
                <>
                  <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                    Edit Campaign
                  </h2>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Edit functionality coming soon for:{" "}
                      <strong>{selectedItem?.title}</strong>
                    </p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setOpenDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setOpenDialog(null)}
                    >
                      Save
                    </Button>
                  </div>
                </>
              )}

              {openDialog === "delete" && (
                <>
                  <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                    Delete Campaign
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Are you sure you want to delete{" "}
                    <strong>{selectedItem?.title}</strong>? This action cannot
                    be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setOpenDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={confirmDelete}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
};

export default ArticleCampaignsPage;
