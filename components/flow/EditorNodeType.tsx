"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import Editor from "../tiptap/Editor";
interface EditorNodeTypeProps {
  isConnectable: boolean;
}

export default memo(function EditorNodeType({
  isConnectable,
}: EditorNodeTypeProps) {
  return (
    <div className="size-max border border-blue-700 p-5">
      <Handle
        type="target"
        position={Position.Left}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Editor className="border border-red-700 nodrag" />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={isConnectable}
      />
    </div>
  );
});
