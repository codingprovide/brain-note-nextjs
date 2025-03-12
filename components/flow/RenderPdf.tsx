"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { memo, useCallback, useState } from "react";
import { Handle, HandleType, Position } from "@xyflow/react";
import { useReactFlow, NodeResizer, useNodeId } from "@xyflow/react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import PdfUploader from "../upload-pdf";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// 共享樣式常數
const cardStyle = {
  minWidth: 200,
  minHeight: 200,
};

interface EditorNodeTypeProps {
  isConnectable: boolean;
  selected: boolean;
  dragging: boolean;
}

interface handleProps {
  id: string;
  position: Position;
  type: HandleType;
}

const handles: handleProps[] = [
  { id: "source-left", position: Position.Left, type: "source" },
  { id: "target-left", position: Position.Left, type: "target" },
  { id: "source-right", position: Position.Right, type: "source" },
  { id: "target-right", position: Position.Right, type: "target" },
  { id: "source-top", position: Position.Top, type: "source" },
  { id: "target-top", position: Position.Top, type: "target" },
  { id: "source-bottom", position: Position.Bottom, type: "source" },
  { id: "target-bottom", position: Position.Bottom, type: "target" },
];

const RenderPdf = memo(function RenderPdf({
  isConnectable,
  selected,
}: EditorNodeTypeProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const handlePrevPage = () => {
    setPageNumber((prev) => (prev <= 1 ? 1 : prev - 1));
  };

  const handleNextPage = () => {
    if (numPages === null) return;
    setPageNumber((prev) => (prev >= numPages ? numPages : prev + 1));
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = Number.parseInt(e.target.value);
    if (numPages === null) return;
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // 刪除節點
  const handleDeleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  }, [nodeId, setNodes]);

  return (
    <Card
      style={cardStyle}
      className={clsx(
        "w-full h-full relative bg-white flex flex-col border-solid border border-gray-400",
        { "border-solid border-2 border-gray-700": selected },
        "nodrag"
      )}
    >
      {/* Header with Delete Button */}
      <CardHeader className="w-full flex-row p-3 rounded-t-xl  hover:bg-gray-100 flex items-center justify-between">
        {saveStatus === "success" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={numPages ?? undefined}
                value={pageNumber}
                onChange={handlePageChange}
                className="w-16 text-center"
              />
              <span className="text-sm text-muted-foreground">
                / {numPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={numPages === null || pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="p-1 w-8 h-8"
                onClick={handleDeleteNode}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete the Node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      {/* Content area with Node Resizer, Editor / Render content, and connection Handles */}
      <CardContent className="overflow-hidden p-3 ">
        <NodeResizer
          minWidth={200}
          minHeight={200}
          isVisible={selected}
          lineClassName="border border-[0.5px] border-transparent"
          handleClassName="bg-transparent border-transparent"
        />

        {handles.map((handle) => (
          <Handle
            key={handle.id}
            id={handle.id}
            type={handle.type}
            position={handle.position}
            isConnectable={isConnectable}
            className="w-2 h-2 border border-[#cbd5e1] bg-white hover:w-6 hover:h-6"
          />
        ))}

        {saveStatus !== "success" && (
          <PdfUploader
            uploadedUrl={uploadedUrl}
            setUploadedUrl={setUploadedUrl}
            setSaveStatus={setSaveStatus}
            saveStatus={saveStatus}
          />
        )}

        {saveStatus === "success" && (
          <div>
            <Document file={uploadedUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
            <p>
              Page {pageNumber} / Total {numPages} Pages
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default RenderPdf;
