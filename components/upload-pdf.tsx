"use client";

import type React from "react";

import { useState, type ChangeEvent, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileIcon,
  UploadCloudIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
// Import API from your actual path
import API from "@/lib/imageUpload/api";

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate progress during upload
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
    return interval;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setUploadedUrl("");
    const selectedFile = e.target.files?.[0];

    if (selectedFile && selectedFile.type !== "application/pdf") {
      setErrorMessage("請選擇 PDF 檔案");
      setFile(null);
      return;
    }
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("請先選擇 PDF 檔案");
      return;
    }

    setUploading(true);
    const progressInterval = simulateProgress();

    try {
      const url = await API.uploadPDF(file);
      setUploadProgress(100);
      setUploadedUrl(url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "上傳失敗，請稍後再試"
      );
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage("");
    setUploadedUrl("");

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type !== "application/pdf") {
      setErrorMessage("請選擇 PDF 檔案");
      return;
    }
    setFile(droppedFile || null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="h-5 w-5 text-primary" />
          上傳 PDF 檔案
        </CardTitle>
        <CardDescription>選擇或拖放 PDF 檔案至下方區域進行上傳</CardDescription>
      </CardHeader>

      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            "flex flex-col items-center justify-center gap-4"
          )}
        >
          <UploadCloudIcon
            className={cn(
              "h-12 w-12 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground/50"
            )}
          />

          {file ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileIcon className="h-4 w-4 text-primary" />
              <span className="max-w-[200px] truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({Math.round(file.size / 1024)} KB)
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">點擊或拖放檔案至此處</p>
              <p className="text-sm text-muted-foreground">僅支援 PDF 檔案</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span>上傳中...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadedUrl && (
          <Alert className="mt-4 bg-primary/10 border-primary">
            <CheckCircleIcon className="h-4 w-4 text-primary" />
            <AlertDescription className="flex flex-col gap-1">
              <span className="font-medium">上傳成功！</span>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline underline-offset-2 truncate"
              >
                {uploadedUrl}
              </a>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full"
        >
          {uploading ? "上傳中..." : "上傳 PDF"}
        </Button>
      </CardFooter>
    </Card>
  );
}
