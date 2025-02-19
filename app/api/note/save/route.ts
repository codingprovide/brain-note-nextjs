import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 400 });
    }

    const userId = user.id;

    const { flowData } = await req.json();

    const note = await prisma.note.create({
      data: {
        userId: userId,
        flowData,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
