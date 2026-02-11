import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const session = await auth();

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { owner: { select: { name: true, image: true } } },
  });

  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!board.isPublic && board.ownerId !== session?.user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(board);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.board.delete({ where: { id: boardId } });

  return NextResponse.json({ success: true });
}
