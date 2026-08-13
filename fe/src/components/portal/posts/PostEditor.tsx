"use client";

import { useEffect, useRef, useState } from "react";
import { Extension } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Heading2,
  Heading3,
  Loader2,
} from "lucide-react";
import { uploadFile } from "@/lib/api/uploadLocal";
import { cn } from "@/lib/utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const FONT_FAMILIES = [
  { label: "Mặc định", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

interface PostEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function PostEditor({ content, onChange, placeholder }: PostEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);

  async function handleImageFile(file: File) {
    if (!editor) return;
    setImageUploading(true);
    try {
      const result = await uploadFile(file, "posts");
      editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
    } catch {
      // silently fail — user can retry
    } finally {
      setImageUploading(false);
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Bắt đầu viết..." }),
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync content from props once after initial load (e.g. when edit page fetches post data)
  const synced = useRef(false);
  useEffect(() => {
    if (!editor || synced.current) return;
    if (content && content !== "<p></p>") {
      editor.commands.setContent(content);
      synced.current = true;
    }
  }, [editor, content]);

  if (!editor) return null;

  const tools = [
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: () => editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: () => editor.isActive("italic"),
    },
    {
      icon: UnderlineIcon,
      title: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: () => editor.isActive("underline"),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: () => editor.isActive("heading", { level: 3 }),
    },
    {
      icon: List,
      title: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Ordered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: () => editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: () => editor.isActive("blockquote"),
    },
    {
      icon: Code,
      title: "Code block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: () => editor.isActive("codeBlock"),
    },
    {
      icon: Link2,
      title: "Link",
      action: () => {
        const url = window.prompt("URL");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
      active: () => editor.isActive("link"),
    },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
        <select
          title="Font chữ"
          value={editor.getAttributes("textStyle").fontFamily ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              editor.chain().focus().setFontFamily(value).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
          className="rounded border border-transparent bg-transparent px-1.5 py-1 text-sm hover:bg-muted focus:outline-none"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          title="Cỡ chữ"
          value={editor.getAttributes("textStyle").fontSize ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              editor.chain().focus().setFontSize(value).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          className="rounded border border-transparent bg-transparent px-1.5 py-1 text-sm hover:bg-muted focus:outline-none"
        >
          <option value="">Cỡ chữ</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <div className="mx-1 h-4 w-px bg-border" />
        {tools.map(({ icon: Icon, title, action, active }) => (
          <button
            key={title}
            type="button"
            title={title}
            onClick={action}
            className={cn(
              "rounded p-1.5 text-sm hover:bg-muted transition-colors",
              active() && "bg-primary/10 text-primary"
            )}
          >
            <Icon size={15} />
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          title="Chèn ảnh"
          disabled={imageUploading}
          onClick={() => imageInputRef.current?.click()}
          className="rounded p-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          {imageUploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {/* Content area */}
      <EditorContent
        editor={editor}
        className="tiptap-content text-sm min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[280px]"
      />
    </div>
  );
}
