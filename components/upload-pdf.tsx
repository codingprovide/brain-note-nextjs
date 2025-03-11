"use client";
import { useState, ChangeEvent } from "react";
// 請依照實際路徑引入 API 模組
import API from "@/lib/imageUpload/api";

export default function UploadPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 當使用者選取檔案時觸發
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const selectedFile = e.target.files?.[0];
    // 檢查是否為 PDF 檔案
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setErrorMessage("請選擇 PDF 檔案");
      setFile(null);
      return;
    }
    setFile(selectedFile || null);
  };

  // 上傳檔案的按鈕觸發函數
  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("請先選擇 PDF 檔案");
      return;
    }
    setUploading(true);
    try {
      const url = await API.uploadPDF(file);
      setUploadedUrl(url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "上傳失敗，請稍後再試"
      );
    }
    setUploading(false);
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        maxWidth: "400px",
      }}
    >
      <h2>上傳 PDF 檔案</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{ marginTop: "10px" }}
      >
        {uploading ? "上傳中..." : "上傳"}
      </button>
      {uploadedUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>上傳成功！檔案連結：</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  );
}
