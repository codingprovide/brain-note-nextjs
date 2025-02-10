"use client";
import clsx from "clsx";
import { memo, useCallback } from "react";
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

interface EditorNodeTypeProps {
  isConnectable: boolean;
  data: any;
  id: string;
}

export default memo(function EditorNodeType({
  isConnectable,
  data,
}: EditorNodeTypeProps) {
  // create a delete node function
  const id = useNodeId();
  const { setNodes } = useReactFlow();
  const handleDeleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, []);
  return (
    // 1. 用 w-full h-full relative 保证本层容器随 NodeResizer 改变大小
    <div
      style={{
        minWidth: 200,
        minHeight: 100,
      }}
      className={clsx(
        " w-full h-full relative bg-white p-1 nodrag overflow-hidden"
      )}
    >
      <div className=" w-full h-auto hover:bg-gray-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className=" size-max p-1"
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
        minHeight={100}
        lineStyle={{ stroke: "#ccc", strokeWidth: 5 }}
        handleStyle={{
          width: 10,
          height: 10,
          fill: "#fff",
          stroke: "#ccc",
          cursor: "nwse-resize",
        }}
      />

      {/* 连接点：左侧 */}
      <Handle
        type="target"
        position={Position.Left}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />

      {/* 3. 再用一层 w-full h-full 来包裹 Editor，确保占满父容器 */}
      {/* 4. Editor 自身也设置 w-full h-full，让其随外层 div 变化 */}
      <Editor
        className={clsx(
          "prose prose-th:bg-black prose-strong:text-inherit prose-p:m-0 prose-sm sm:prose-base lg:prose-lg xl:prose-2xl",
          "focus:outline-none",
          "p-5",
          "w-full h-full",
          "bg-white",
          "max-w-none max-h-none"
        )}
        data={data}
      />

      {/* 连接点：右侧 */}
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={isConnectable}
      />
    </div>
  );
});
