// 修改 app/api/documents/pdf/get/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma";
export async function GET() {
  try {
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

    // 确保查询语法正确
    const documents = await prisma.document.findMany({
      where: {
        userId,
        type: "pdf",
      },
    });
    console.log("api documents", documents);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching PDF documents:", error); // 添加详细日志
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
