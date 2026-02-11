"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, Copy, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface BoardCardProps {
  board: {
    id: string;
    title: string;
    slug: string;
    isPublic: boolean;
    updatedAt: string;
    thumbnail: string | null;
  };
  onDelete: (id: string) => void;
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCopyLink() {
    const url = `${window.location.origin}/board/${board.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    setMenuOpen(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      const res = await fetch(`/api/boards/${board.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(board.id);
      toast.success("Board deleted");
    } catch {
      toast.error("Failed to delete board");
    }
    setMenuOpen(false);
  }

  return (
    <div
      className="group relative border border-foreground/10 rounded-xl overflow-hidden hover:border-foreground/20 transition-colors cursor-pointer"
      onClick={() => router.push(`/board/${board.id}`)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-foreground/5 flex items-center justify-center">
        {board.thumbnail ? (
          <img
            src={board.thumbnail}
            alt={board.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-foreground/20 text-4xl font-bold">
            {board.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="font-medium text-sm truncate">{board.title}</h3>
          <p className="text-xs text-foreground/50">
            {new Date(board.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {board.isPublic && (
            <Globe className="w-3.5 h-3.5 text-foreground/40" />
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded hover:bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-foreground/10 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-foreground/5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy link
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-foreground/5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
