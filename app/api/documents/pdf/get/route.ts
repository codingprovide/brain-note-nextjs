import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "未授权", documents: [] },
        { status: 401 }
      );
    }

    // 根据 session 中的 email 查询用户，获取 user id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "找不到用户", documents: [] },
        { status: 400 }
      );
    }

    const userId = user.id;

    const documents = await prisma.document.findMany({
      where: {
        userId,
        type: "pdf",
      },
    });

    return NextResponse.json({ documents: documents ?? [] });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal Server Error", documents: [] },
      { status: 500 }
    );
  }
}
