"use client";

import { useEffect, useState } from "react";
import { BoardCard } from "@/components/board/board-card";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { LayoutDashboard } from "lucide-react";

interface Board {
  id: string;
  title: string;
  slug: string;
  isPublic: boolean;
  updatedAt: string;
  thumbnail: string | null;
}

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/boards")
      .then((res) => res.json())
      .then((data) => setBoards(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            <h1 className="text-lg font-semibold">Whiteboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <CreateBoardDialog />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-6">Your Boards</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-foreground/10 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-foreground/5" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-foreground/5 rounded w-2/3" />
                  <div className="h-3 bg-foreground/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground/50 mb-4">
              No boards yet. Create your first one!
            </p>
            <CreateBoardDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
