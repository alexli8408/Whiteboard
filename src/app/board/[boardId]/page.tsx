import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Whiteboard } from "@/components/canvas/whiteboard";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board) {
    notFound();
  }

  // Only owner or public boards
  if (board.ownerId !== session.user.id && !board.isPublic) {
    redirect("/dashboard");
  }

  return <Whiteboard boardId={board.id} boardTitle={board.title} />;
}
