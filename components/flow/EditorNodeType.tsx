"use client";

import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, HandleType, Position } from "@xyflow/react";
import { useReactFlow, NodeResizer, useNodeId } from "@xyflow/react";
import { Trash2, Brush } from "lucide-react";
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
};

interface EditorNodeTypeProps {
  isConnectable: boolean;
  data: { content: JSONContent | undefined; html: string | undefined };
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

const EditorNodeType = memo(function EditorNodeType({
  isConnectable,
  data,
  selected,
  dragging,
}: EditorNodeTypeProps) {
  const EditorModes = {
    TEXT: "text",
    DRAW: "draw",
  };

  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const [isEditable, setIsEditable] = useState(false);
  const [editorMode, setEditorMode] = useState(EditorModes.TEXT);

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dragging) {
      setIsEditable(false);
    } else if (selected) {
      setIsEditable(true);
    } else {
      setIsEditable(false);
    }
  }, [dragging, selected]);

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

  // when click other node , the editor not close
  // when edior is open , drag the node editor should be close, when drag end, editor should be open

  return (
    <Card
      style={cardStyle}
      className={clsx(
        "w-full h-full relative bg-white flex flex-col border-solid border border-gray-400",
        { nodrag: isEditable },
        { "border-solid border-2 border-gray-700": selected }
      )}
      ref={nodeRef}
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="p-1 w-8 h-8"
                onClick={handleDeleteNode}
              >
                <Brush className="w-4 h-4" />
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

        {/* 編輯器或靜態內容 */}
        {isEditable ? (
          <Editor
            className={clsx(
              "bg-white min-h-full focus:outline-none",
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
              "bg-white min-h-full focus:outline-none",
              "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl",
              "prose-th:bg-black prose-strong:text-inherit prose-p:m-0"
            )}
            html={data.html ?? ""}
          />
        )}
      </CardContent>
    </Card>
  );
});

export default EditorNodeType;
