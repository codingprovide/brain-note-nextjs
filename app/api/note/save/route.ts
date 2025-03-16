import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import prisma from "@/prisma";
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const { flowData, id } = await req.json();

    if (id) {
      // 更新指定筆記
      await prisma.note.update({
        where: { id },
        data: { flowData },
      });
      return NextResponse.json({ success: true });
    } else {
      // 創建新筆記
      const newNote = await prisma.note.create({
        data: {
          userId: user.id,
          flowData,
        },
      });
      return NextResponse.json({ success: true, id: newNote.id });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知錯誤";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
