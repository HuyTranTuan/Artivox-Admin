import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import RichTextEditor from "@components/ui/RichTextEditor";

const locales = [
  { value: "VI", label: "VI" },
  { value: "EN", label: "EN" },
  { value: "VI / EN", label: "VI / EN" },
];

const statuses = [
  { value: "Draft", label: "Draft" },
  { value: "Review", label: "Review" },
  { value: "Published", label: "Published" },
];

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [locale, setLocale] = useState("VI / EN");
  const [status, setStatus] = useState("Draft");
  const [content, setContent] = useState("");

  const handleSave = () => {
    navigate("/articles");
  };

  const handleCancel = () => {
    navigate("/articles");
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleCancel} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-title text-xl font-bold text-slate-900">Create article</h2>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title..."
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Locale */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Locale</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          >
            {locales.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          >
            {statuses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content - Rich Text Editor */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="Write your article content here..." />
        </div>
      </Card>
    </section>
  );
};

export default CreateArticlePage;
