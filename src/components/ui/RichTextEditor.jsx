import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2, Heading3, Pilcrow } from "lucide-react";
import { useCallback } from "react";

const ToolbarButton = ({ onClick, active, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
      active ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="h-6 w-px bg-slate-200" />;

const RichTextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none min-h-[300px] px-4 py-4 text-sm text-slate-900 outline-none focus:outline-none",
        placeholder,
      },
    },
  });

  const toggleHeading = useCallback(
    (level) => {
      editor?.chain().focus().toggleHeading({ level }).run();
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-slate-300 overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => toggleHeading(1)} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleHeading(2)} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleHeading(3)} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph">
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
