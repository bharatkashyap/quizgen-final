import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

export function IntroMenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              editor.isActive("bold") ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              editor.isActive("italic") ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
          >
            <Italic className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              editor.isActive("bulletList")
                ? "bg-gray-100 dark:bg-gray-800"
                : ""
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              editor.isActive("orderedList")
                ? "bg-gray-100 dark:bg-gray-800"
                : ""
            }`}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              editor.isActive({ textAlign: "left" })
                ? "bg-gray-100 dark:bg-gray-800"
                : ""
            }`}
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              editor.isActive({ textAlign: "center" })
                ? "bg-gray-100 dark:bg-gray-800"
                : ""
            }`}
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              editor.isActive({ textAlign: "right" })
                ? "bg-gray-100 dark:bg-gray-800"
                : ""
            }`}
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
