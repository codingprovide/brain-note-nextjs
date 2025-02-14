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
import Editor from "../tiptap/Editor";
import { JSONContent } from "@tiptap/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Extracted constants for shared styles
const cardStyle = { minWidth: 200, minHeight: 200 };

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
  data: { content: JSONContent | undefined };
  selected: boolean;
}

const EditorNodeType = memo(function EditorNodeType({
  isConnectable,
  data,
  selected,
}: EditorNodeTypeProps) {
  const [isEditor, setIsEditor] = useState(false);
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);

  // Close editor if click occurs outside the node
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Delete current node
  const handleDeleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  }, [nodeId, setNodes]);

  // Update node content on editor change
  const handleContentChange = useCallback(
    (content: JSONContent | undefined) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, content } }
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
        { nodrag: isEditor }
      )}
      onDoubleClick={() => setIsEditor(true)}
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

      {/* Content area with Node Resizer, Editor, and connection Handles */}
      <CardContent className="overflow-hidden">
        <NodeResizer
          minWidth={200}
          minHeight={200}
          lineStyle={nodeResizerLineStyle}
          handleStyle={nodeResizerHandleStyle}
          isVisible={selected}
        />

        {/* Left side connection handles */}
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

        {/* Editor */}
        <Editor
          className={clsx(
            // Base styles
            "bg-white min-h-full p-5 focus:outline-none",

            // Typography defaults
            "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl",

            // Custom prose modifications
            "prose-th:bg-black prose-strong:text-inherit prose-p:m-0"
          )}
          data={data}
          onContentChange={handleContentChange}
        />

        {/* Right side connection handles */}
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

        {/* Top connection handles */}
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

        {/* Bottom connection handles */}
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
