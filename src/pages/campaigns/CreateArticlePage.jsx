import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
    // Mock save - will integrate with service later
    navigate("/campaigns/article");
  };

  const handleCancel = () => {
    navigate("/campaigns/article");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="font-title text-xl font-bold text-slate-900">
              Create article
            </h2>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </label>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Locale
            </label>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
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

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Content
            </label>
            <div className="rounded-xl border border-slate-300 overflow-hidden">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Write your article content here..."
                className="h-64"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateArticlePage;
