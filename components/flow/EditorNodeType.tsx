"use client";

import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, HandleType, Position } from "@xyflow/react";
import { useReactFlow, NodeResizer, useNodeId } from "@xyflow/react";

import Editor from "../tiptap/Editor";
import { JSONContent } from "@tiptap/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import RenderNodeContent from "../ui/render-note-content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { useOnSelectionChange, useNodes } from "@xyflow/react";
import { useNodeStore } from "@/store/nodes-store";

// 共享樣式常數
const cardSize = {
  minWidth: 274,
  minHeight: 68,
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
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const [isEditable, setIsEditable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const nodes = useNodes();
  const nodeRef = useRef<HTMLDivElement>(null);

  const { setSelectedNodes, setSelectedNodeIds, selectedNodes } = useNodeStore(
    (state) => state
  );

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

  // 選取節點時更新選取狀態
  const onChange = useCallback(() => {
    if (nodeId === null) return;
    const nodesMap = new Map(nodes.map((item) => [item.id, item]));
    const node = nodesMap.get(nodeId);
    if (!node) return;

    setSelectedNodeIds((prevIds) => {
      if (prevIds.has(nodeId)) {
        return prevIds;
      }
      const newIds = new Set(prevIds);
      newIds.add(nodeId);
      setSelectedNodes((prevNodes) => [...prevNodes, node]);
      return newIds;
    });
  }, [nodeId, nodes, setSelectedNodes, setSelectedNodeIds]);

  useOnSelectionChange({
    onChange,
  });

  useEffect(() => {
    console.log("更新後的 selectedNodes", selectedNodes);
  }, [selectedNodes]);

  // when click other node , the editor not close
  // when edior is open , drag the node editor should be close, when drag end, editor should be open

  return (
    <Card
      style={cardSize}
      className={clsx(
        "w-full h-full relative bg-white flex flex-col border-solid border border-gray-400 box-border",
        { nodrag: isEditable },
        { "border-solid border-2 border-gray-700": selected }
      )}
      ref={nodeRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Header with Delete Button */}
      <CardHeader className=" w-full h-5 p-1 rounded-t-xl  hover:bg-gray-100 flex flex-row items-center justify-end ">
        <DropdownMenu>
          <DropdownMenuTrigger className={clsx(!isVisible && "opacity-0")}>
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleDeleteNode} className=" gap-12">
                Delete
                <DropdownMenuShortcut>Backspace</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Content area with Node Resizer, Editor / Render content, and connection Handles */}
      <CardContent
        className="overflow-hidden pt-1 pb-2 px-3
       "
      >
        <NodeResizer
          minWidth={cardSize.minWidth}
          minHeight={cardSize.minHeight}
          isVisible={selected}
          lineClassName="border border-[10px] border-transparent"
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
        {/* {isEditable ? (
    
        ) : (
          <RenderNodeContent
            className={clsx(
              "bg-white min-h-full focus:outline-none",
              "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl",
              "prose-th:bg-black prose-strong:text-inherit prose-p:m-0"
            )}
            html={data.html ?? ""}
          />
        )} */}

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
      </CardContent>
    </Card>
  );
});

export default EditorNodeType;
