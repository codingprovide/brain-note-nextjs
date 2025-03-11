import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
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

  const { title, authors, abstract, pdfUrl, fileName } = await request.json();

  if (!pdfUrl || !fileName) {
    return NextResponse.json({ error: "PDF 上傳失敗" }, { status: 400 });
  }

  try {
    const document = await prisma.document.create({
      data: {
        title,
        authors,
        abstract,
        pdfUrl,
        fileName,
        user: { connect: { id: userId } },
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("保存文件失敗:", error);
    return NextResponse.json(
      { error: "保存文件失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
