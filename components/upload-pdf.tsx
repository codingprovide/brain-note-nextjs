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
  // CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
// Import API from your actual path
import API from "@/lib/imageUpload/api";
import clsx from "clsx";

export default function PdfUploader({
  uploadedUrl,
  setUploadedUrl,
  saveStatus,
  setSaveStatus,
}: {
  uploadedUrl: string;
  saveStatus: string;
  setSaveStatus: (status: string) => void;
  setUploadedUrl: (url: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // 論文元數據狀態
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [abstract, setAbstract] = useState("");

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
      setErrorMessage("Please select a PDF file first.");
      setFile(null);
      return;
    }
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a PDF file first.");
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
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again later."
      );
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
    }
  };

  // 呼叫 API 保存文件元數據
  const handleSaveMetadata = async () => {
    if (!uploadedUrl) return;

    if (!file) {
      setErrorMessage("Please select a PDF file first.");
      return;
    }

    try {
      const response = await fetch("/api/documents/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          authors,
          abstract,
          pdfUrl: uploadedUrl,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Save failed");
      }
      // const data = await response.json();
      setSaveStatus("success");
    } catch (error: unknown) {
      setSaveStatus(error instanceof Error ? error.message : "Save failed");
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
      setErrorMessage("Please select a PDF file");
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
          Upload PDF File
        </CardTitle>
        <CardDescription>
          Select or drag and drop a PDF file into the area below to upload
        </CardDescription>
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
              <p className="font-medium">Click or drag and drop files here</p>
              <p className="text-sm text-muted-foreground">
                Only PDF files are supported.
              </p>
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
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* 當 PDF 上傳成功後，顯示填寫元數據表單 */}
        {uploadedUrl && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium">
              Please fill in the paper metadata.
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              placeholder="Authors"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="w-full border rounded p-2"
            />
            <textarea
              placeholder="Abstract (optional)"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="w-full border rounded p-2"
            />
            <Button onClick={handleSaveMetadata} className="w-full">
              Save Literature
            </Button>
            {saveStatus && (
              <Alert className="mt-2">
                <AlertDescription>{saveStatus}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={clsx("w-full", { hidden: uploadedUrl })}
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </Button>
      </CardFooter>
    </Card>
  );
}
