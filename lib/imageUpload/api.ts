import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class API {
  private static r2 = new S3Client({
    region: "auto", // Cloudflare R2 的區域使用 'auto'
    endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT || "",
    forcePathStyle: true, // 確保路徑風格正確
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY || "",
    },
  });

  public static uploadImage = async (file: File) => {
    try {
      // 產生一個唯一的檔案名稱

      const fileName = `uploads/${Date.now()}-${file.name}`;

      // 讀取 File 內容轉成 ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // 建立 S3 上傳命令
      const uploadCommand = new PutObjectCommand({
        Bucket: "brain-note-storage", // Cloudflare R2 存儲桶名稱
        Key: fileName, // 上傳後的檔案名稱
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type, // 保留原始檔案類型
        ACL: "public-read", // 設定為公開讀取
      });

      // 執行上傳
      await API.r2.send(uploadCommand);

      // 返回可訪問的圖片 URL
      return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
    } catch (error) {
      console.error("上傳圖片失敗:", error);
      throw new Error("上傳圖片失敗，請稍後再試");
    }
  };

  public static uploadPDF = async (file: File) => {
    try {
      // 檢查檔案類型是否為 PDF
      if (file.type !== "application/pdf") {
        throw new Error("請上傳 PDF 檔案");
      }

      const fileName = `uploads/${Date.now()}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();
      const uploadCommand = new PutObjectCommand({
        Bucket: "brain-note-storage", // Cloudflare R2 存儲桶名稱
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        ACL: "public-read", // 設定為公開讀取
      });

      await API.r2.send(uploadCommand);

      return {
        url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`,
        objectKey: fileName,
      };
    } catch (error) {
      console.error("上傳PDF失敗:", error);
      throw new Error("上傳PDF失敗，請稍後再試");
    }
  };
}

export default API;
