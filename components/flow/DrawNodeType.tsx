"use client";

import { memo } from "react";
import {
  Handle,
  Position,
  NodeToolbar,
  NodeResizer,
  useReactFlow,
} from "@xyflow/react";
import { Button } from "../ui/Button";
import Draw from "../draw/Draw";
interface DrawNodeType {
  isConnectable: boolean;
  id: string;
  data: any;
}

export default memo(function DrawNodeType({
  isConnectable,
  data,
  id,
}: DrawNodeType) {
  const { getNodesBounds, getNode } = useReactFlow();
  // 先获取指定 id 的节点
  const node = getNode(id);

  // 如果 node 存在，则将其包装成数组传入，否则传入一个空数组
  const bounds = getNodesBounds(node ? [node] : []);

  return (
    <div className="size-max  p-3 bg-white">
      {/* <NodeToolbar position={data.toolbarPosition}>
        <Button>delete</Button>
      </NodeToolbar> */}
      <Handle
        type="target"
        position={Position.Left}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Draw width={bounds.width} height={bounds.height} />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={isConnectable}
      />
    </div>
  );
});
