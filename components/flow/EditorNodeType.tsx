"use client";

import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  useReactFlow,
  NodeResizer,
  useNodeId,
  useConnection,
} from "@xyflow/react";
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
import { throttle } from "lodash";
import { useToolBarStore, ToolBarState } from "@/store/tool-bar-store";

// 共享樣式常數
const cardStyle = {
  minWidth: 200,
  minHeight: 200,
};

const handleXStyle =
  "w-[50%] h-full tr border border-[#cbd5e1] bg-white rounded-none translate-x-0 -translate-y-1/2 opacity-0 ";

const handleYStyle =
  "w-full h-[50%] tr border border-[#cbd5e1] bg-white rounded-none translate-y-0 -translate-x-1/2 opacity-0";

const handleNormalStyle = "w-5 h-5  border border-[#cbd5e1] bg-white";

interface EditorNodeTypeProps {
  isConnectable: boolean;
  data: { content: JSONContent | undefined; html: string | undefined };
  selected: boolean;
  dragging: boolean;
}

const EditorNodeType = memo(function EditorNodeType({
  isConnectable,
  data,
  selected,
  dragging,
}: EditorNodeTypeProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const [isEditable, setIsEditable] = useState(false);
  const [handleposition, setHandlePosition] = useState("");

  const { activeTool } = useToolBarStore<ToolBarState>((state) => state);

  const nodeRef = useRef<HTMLDivElement>(null);
  const connection = useConnection();
  const isTarget = connection.inProgress && connection.fromNode.id !== nodeId;
  const isTargetShow = isTarget || !connection.inProgress;
  const isConnecting = connection.inProgress; // 是否正在拖曳連線
  // !connection.inProgress &&
  const handleLeftSourceShow =
    handleposition === "left" && activeTool === "Connection";
  const handleRightSourceShow =
    handleposition === "right" && activeTool === "Connection";
  const handleTopSourceShow =
    handleposition === "top" && activeTool === "Connection";
  const handleBottomSourceShow =
    handleposition === "bottom" && activeTool === "Connection";
  // && isTargetShow
  const handleLeftTargetShow =
    handleposition === "left" && activeTool === "Connection";
  const handleRightTargetShow =
    handleposition === "right" && activeTool === "Connection";
  const handleTopTargetShow =
    handleposition === "top" && activeTool === "Connection";
  const handleBottomTargetShow =
    handleposition === "bottom" && activeTool === "Connection";

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // if (activeTool !== "Connection") return;
      if (!nodeRef.current) return;

      const rect = nodeRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      // 計算到各邊的距離
      const leftDistance = offsetX;
      const rightDistance = rect.width - offsetX;
      const topDistance = offsetY;
      const bottomDistance = rect.height - offsetY;

      // 找出最小距離
      const minDistance = Math.min(
        leftDistance,
        rightDistance,
        topDistance,
        bottomDistance
      );

      // 根據最小距離判斷最近的邊
      let newPosition = "";
      switch (minDistance) {
        case leftDistance:
          newPosition = "left";
          break;
        case rightDistance:
          newPosition = "right";
          break;
        case topDistance:
          newPosition = "top";
          break;
        case bottomDistance:
          newPosition = "bottom";
          break;
      }

      setHandlePosition(newPosition);
    },
    [nodeRef]
  );

  // 當滑鼠距離某邊小於緩衝區時，認為該邊需要顯示 handle
  const handleMouseLeave = useCallback(() => {
    setHandlePosition("");
  }, []);

  useEffect(() => {
    // Debug: 可檢查當前各邊顯示狀態
    console.log("Edge visibility:", handleposition);
  }, [handleposition]);

  const throttledMouseMove = useRef(throttle(handleMouseMove, 50)).current;

  useEffect(() => {
    if (activeTool === "Connection") {
      setIsEditable(false);
      return;
    }

    if (dragging) {
      setIsEditable(false);
    } else if (selected) {
      setIsEditable(true);
    } else {
      setIsEditable(false);
    }
  }, [dragging, selected, activeTool]);

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
        "w-full h-full relative bg-white flex flex-col border-solid border border-gray-400",
        { nodrag: isEditable && activeTool === "Connection" },
        { "border-solid border-2 border-gray-700": selected }
      )}
      ref={nodeRef}
      onMouseMove={throttledMouseMove}
      onMouseLeave={activeTool === "Connection" ? handleMouseLeave : undefined}
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
          isVisible={selected && activeTool !== "Connection"}
          lineClassName="border border-[0.5px] border-transparent"
          handleClassName="bg-transparent border-transparent"
        />
        <Handle
          type="source"
          position={Position.Left}
          id="source-left"
          isConnectable={isConnectable}
          className={clsx(!isConnecting ? handleXStyle : handleNormalStyle, {
            invisible: !handleLeftSourceShow,
          })}
        />

        <Handle
          type="target"
          position={Position.Left}
          id="target-left"
          isConnectable={isConnectable}
          className={clsx(!isConnecting ? handleNormalStyle : handleXStyle, {
            invisible: !handleLeftTargetShow,
          })}
        />

        <Handle
          type="source"
          position={Position.Right}
          id="source-right"
          isConnectable={isConnectable}
          className={clsx(!isConnecting ? handleXStyle : handleNormalStyle, {
            invisible: !handleRightSourceShow,
          })}
        />

        <Handle
          type="target"
          position={Position.Right}
          id="target-right"
          className={clsx(!isConnecting ? handleNormalStyle : handleXStyle, {
            invisible: !handleRightTargetShow,
          })}
        />

        <Handle
          type="source"
          position={Position.Top}
          id="source-top"
          isConnectable={isConnectable}
          className={clsx(handleYStyle, {
            invisible: !handleTopSourceShow,
          })}
        />

        <Handle
          type="target"
          position={Position.Top}
          id="target-top"
          isConnectable={isConnectable}
          className={clsx("w-5 h-5  border border-[#cbd5e1] bg-white", {
            invisible: !handleTopTargetShow,
          })}
        />

        <Handle
          type="source"
          position={Position.Bottom}
          id="source-bottom"
          isConnectable={isConnectable}
          className={clsx(handleYStyle, {
            invisible: !handleBottomSourceShow,
          })}
        />

        <Handle
          type="target"
          position={Position.Bottom}
          id="target-bottom"
          isConnectable={isConnectable}
          className={clsx("w-5 h-5  border border-[#cbd5e1] bg-white", {
            invisible: !handleBottomTargetShow,
          })}
        />

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
