"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function PostEditor({ content, onChange, placeholder }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Bắt đầu viết..." }),
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
      editor.commands.setContent(content, false);
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
      </div>
      {/* Content area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[280px]"
      />
    </div>
  );
}
