"use client";

import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { useReactFlow, NodeResizer, useNodeId } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Editor from "../tiptap/Editor";
import { JSONContent } from "@tiptap/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import RenderNodeContent from "../ui/render-note-content";

// 共享樣式常數
const cardStyle = {
  minWidth: 200,
  minHeight: 200,
  // 透過 will-change 提升硬體加速效果
  willChange: "transform",
};

const handleStyle = {
  width: 8,
  height: 8,
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "#cbd5e1",
  backgroundColor: "white",
};

const nodeResizerLineStyle = { stroke: "#ccc", strokeWidth: 5 };
const nodeResizerHandleStyle = {
  width: 10,
  height: 10,
  fill: "#fff",
  stroke: "#ccc",
  cursor: "nwse-resize",
};

interface EditorNodeTypeProps {
  isConnectable: boolean;
  data: { content: JSONContent | undefined; html: string | undefined };
  selected: boolean;
}

const EditorNodeType = memo(function EditorNodeType({
  isConnectable,
  data,
  selected,
}: EditorNodeTypeProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const [isEditable, setIsEditable] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // 當點擊節點外部時關閉編輯器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        nodeRef.current &&
        event.target instanceof HTMLElement &&
        !nodeRef.current.contains(event.target) &&
        !event.target.closest(".popover-content") &&
        !event.target.closest(".tippy-box")
      ) {
        setIsEditable(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 刪除節點
  const handleDeleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  }, [nodeId, setNodes]);

  // 編輯器內容改變時更新節點資料
  const handleContentChange = useCallback(
    (content: JSONContent | undefined, html: string | undefined) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, content, html } }
            : node
        )
      );
    },
    [nodeId, setNodes]
  );

  return (
    <Card
      style={cardStyle}
      className={clsx(
        "w-full h-full relative bg-white flex flex-col border-solid border-4 border-gray-400",
        { nodrag: isEditable }
      )}
      onDoubleClick={() => setIsEditable(true)}
      ref={nodeRef}
    >
      {/* Header with Delete Button */}
      <CardHeader className="w-full p-1 hover:bg-gray-100 flex items-center justify-between">
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
      <CardContent className="overflow-hidden ">
        <NodeResizer
          minWidth={200}
          minHeight={200}
          lineStyle={nodeResizerLineStyle}
          handleStyle={nodeResizerHandleStyle}
          isVisible={selected}
        />

        {/* 左側連接點 */}
        <Handle
          id="target-left"
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={handleStyle}
        />
        <Handle
          id="source-left"
          type="source"
          position={Position.Left}
          isConnectable={isConnectable}
          style={handleStyle}
        />

        {/* 編輯器或靜態內容 */}
        {isEditable ? (
          <Editor
            className={clsx(
              "bg-white min-h-full p-5 focus:outline-none",
              "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl",
              "prose-th:bg-black prose-strong:text-inherit prose-p:m-0"
            )}
            data={data}
            onContentChange={handleContentChange}
            isEditable={isEditable}
          />
        ) : (
          <RenderNodeContent
            className={clsx(
              "bg-white min-h-full p-5 focus:outline-none",
              "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl",
              "prose-th:bg-black prose-strong:text-inherit prose-p:m-0"
            )}
            html={data.html ?? ""}
          />
        )}

        {/* 右側連接點 */}
        <Handle
          id="source-right"
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={handleStyle}
        />
        <Handle
          id="target-right"
          type="target"
          position={Position.Right}
          isConnectable={isConnectable}
          style={handleStyle}
        />

        {/* 上方連接點 */}
        <Handle
          id="source-top"
          type="source"
          position={Position.Top}
          isConnectable={isConnectable}
          style={handleStyle}
        />
        <Handle
          id="target-top"
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={handleStyle}
        />

        {/* 下方連接點 */}
        <Handle
          id="source-bottom"
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={handleStyle}
        />
        <Handle
          id="target-bottom"
          type="target"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={handleStyle}
        />
      </CardContent>
    </Card>
  );
});

export default EditorNodeType;
