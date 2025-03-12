import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  // 根據 session 中的 email 查詢使用者，取得 user id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "找不到使用者" }, { status: 400 });
  }

  const userId = user.id;

  try {
    const documents = await prisma.document.findMany({
      where: {
        userId,
        type: "pdf",
      },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
