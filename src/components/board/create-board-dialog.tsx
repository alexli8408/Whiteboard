"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Untitled Board" }),
      });

      if (!res.ok) throw new Error("Failed to create board");

      const board = await res.json();
      setOpen(false);
      setTitle("");
      router.push(`/board/${board.id}`);
    } catch {
      toast.error("Failed to create board");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        New Board
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-background border border-foreground/10 rounded-xl p-6 w-full max-w-md shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-semibold mb-4">Create New Board</h2>

            <input
              type="text"
              placeholder="Board title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full px-3 py-2 border border-foreground/20 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20 mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
