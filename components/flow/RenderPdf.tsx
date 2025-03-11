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
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, HandleType, Position } from "@xyflow/react";
import { useReactFlow, NodeResizer, useNodeId } from "@xyflow/react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

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
  data,
  selected,
  dragging,
}: EditorNodeTypeProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

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
      <CardHeader className="w-full p-1 rounded-t-xl  hover:bg-gray-100 flex items-center justify-between">
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

        <div>
          <Document
            file="https://pub-059988cbda3e4e14840e5d023c91d7c5.r2.dev/brain-note-storage/uploads/1741707023751-jimmunol.1400766.pdf" // 可替换为你的 PDF 文件路径或 URL
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} />
          </Document>
          <p>
            第 {pageNumber} 页 / 共 {numPages} 页
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default RenderPdf;
