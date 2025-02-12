"use client";
import clsx from "clsx";
import { memo, useCallback, useState, useEffect, useRef } from "react";
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
import { v4 as uuid } from "uuid";

import Editor from "../tiptap/Editor";

interface EditorNodeTypeProps {
  isConnectable: boolean;
  data: any;
  id: string;
  selected: boolean;
}

export default memo(function EditorNodeType({
  isConnectable,
  data,
  selected,
}: EditorNodeTypeProps) {
  const [isEditor, setIsEditor] = useState(false);
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        nodeRef.current &&
        event.target instanceof HTMLElement &&
        !nodeRef.current.contains(event.target)
      ) {
        setIsEditor(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       nodeRef.current &&
  //       event.target instanceof HTMLElement &&
  //       !nodeRef.current.contains(event.target)
  //     ) {
  //       // Check if the clicked element is inside the tippy-content (bubble menu)
  //       let isClickInsideTippyContent = false;
  //       let targetElement = event.target as HTMLElement | null;
  //       while (targetElement) {
  //         if (targetElement.classList.contains("tippy-content")) {
  //           isClickInsideTippyContent = true;
  //           break;
  //         }
  //         targetElement = targetElement.parentElement;
  //         if (!targetElement) break;
  //       }

  //       // Only close the editor if the click is NOT inside the tippy-content
  //       if (!isClickInsideTippyContent) {
  //         setIsEditor(false);
  //       }
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const handleDeleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  }, [nodeId, setNodes]);

  const handleContentChange = useCallback(
    (content) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, content: content }, // <-- 在这里更新
            };
          }
          return node;
        })
      );
    },
    [nodeId, setNodes]
  );

  return (
    /**
     * 1. 仍保持 w-full h-full relative + minWidth/minHeight
     *    但增加 flex flex-col，使内部可分为“顶部按钮区”和“编辑器区”。
     */
    <div
      style={{
        minWidth: 200,
        minHeight: 200,
      }}
      className={clsx(
        "w-full h-full relative bg-white",
        "flex flex-col",
        { nodrag: isEditor } // ← 新增
      )}
      onDoubleClick={() => setIsEditor(true)}
      ref={nodeRef}
    >
      {/* 顶部按钮区 */}
      <div className="w-full p-1 hover:bg-gray-100 flex items-center justify-between">
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
      </div>

      <NodeResizer
        minWidth={200}
        minHeight={200}
        lineStyle={{ stroke: "#ccc", strokeWidth: 5 }}
        handleStyle={{
          width: 10,
          height: 10,
          fill: "#fff",
          stroke: "#ccc",
          cursor: "nwse-resize",
        }}
        isVisible={selected}
      />

      {/* 左侧连线把手 */}
      <Handle
        id={"target-left"}
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />
      <Handle
        id={"source-left"}
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />

      {/**
       * 2. 编辑器区，使用 flex-grow 或 flex-1 填满剩余空间
       *    并通过 overflow-auto 保证超出时出现滚动条。
       */}
      <div className="flex-1 px-1 overflow-hidden">
        <Editor
          className={clsx(
            "prose prose-th:bg-black prose-strong:text-inherit prose-p:m-0 prose-sm sm:prose-base lg:prose-lg xl:prose-2xl",
            "focus:outline-none",
            "p-5",
            "w-full min-h-full", // 可以加一个 min-h-full，让编辑器本身初始铺满容器
            "bg-white",
            "max-w-none max-h-none"
          )}
          data={data}
          onContentChange={handleContentChange}
        />
      </div>

      {/* 右侧连线把手 */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />
      <Handle
        id={"target-right"}
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />
      <Handle
        id={"target-top"}
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />
      <Handle
        id={"target-bottom"}
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{
          width: 8,
          height: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "white",
        }}
      />
    </div>
  );
});
