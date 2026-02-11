"use client";

import { Tldraw, Editor, exportAs, getUserPreferences, setUserPreferences, TLAssetStore } from "tldraw";
import { useSync } from "@tldraw/sync";
import "tldraw/tldraw.css";
import { useCallback, useMemo, useState } from "react";
import { Download, ArrowLeft, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Set dark mode in localStorage BEFORE any component renders.
if (typeof window !== "undefined") {
  const prefs = getUserPreferences();
  if (prefs.colorScheme !== "dark") {
    setUserPreferences({ ...prefs, colorScheme: "dark" });
  }
}

interface WhiteboardProps {
  boardId: string;
  boardTitle: string;
}

const SYNC_SERVER_URL =
  process.env.NEXT_PUBLIC_SYNC_SERVER_URL || "ws://localhost:5858";

// Stable asset store — defined outside the component so it never changes identity.
// This prevents useSync's useEffect from re-running on every render.
const assetStore: TLAssetStore = {
  upload: async (_asset, file) => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    });

    if (!res.ok) throw new Error("Failed to get upload URL");

    const { uploadUrl, fileUrl } = await res.json();

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return fileUrl;
  },
  resolve: async (asset) => {
    if (!asset.props || !("src" in asset.props)) return null;
    return (asset.props as { src: string }).src;
  },
};

export function Whiteboard({ boardId, boardTitle }: WhiteboardProps) {
  const [editor, setEditor] = useState<Editor | null>(null);

  const store = useSync({
    uri: `${SYNC_SERVER_URL}/board/${boardId}`,
    assets: assetStore,
  });

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
  }, []);

  const handleExport = useCallback(async () => {
    if (!editor) return;

    const shapeIds = [...editor.getCurrentPageShapeIds()];
    if (shapeIds.length === 0) {
      toast.error("Nothing to export — add some shapes first");
      return;
    }

    await exportAs(editor, shapeIds, {
      format: "png",
      name: boardTitle || "whiteboard",
    });

    toast.success("Exported as PNG");
  }, [editor, boardTitle]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }, []);

  if (store.status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-foreground/50">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting to board...</span>
        </div>
      </div>
    );
  }

  if (store.status === "error") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to connect to the board</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Top bar */}
      <div className="h-12 border-b border-foreground/10 bg-background flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded hover:bg-foreground/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-medium text-sm">{boardTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Tldraw store={store} onMount={handleMount} />
      </div>
    </div>
  );
}
