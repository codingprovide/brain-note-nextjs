import React, { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
interface FlowContexMenuProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClick: () => void;
}

export default function FlowContexMenu({
  top,
  left,
  right,
  bottom,
  ...props
}: FlowContexMenuProps) {
  // const { getNode, setNodes, addNodes, setEdges } = useReactFlow();
  // // const duplicateNode = useCallback(() => {
  //   const node = getNode(id);
  //   const position = {
  //     x: node.position.x + 50,
  //     y: node.position.y + 50,
  //   };

  //   addNodes({
  //     ...node,
  //     selected: false,
  //     dragging: false,
  //     id: `${node.id}-copy`,
  //     position,
  //   });
  // }, [id, getNode, addNodes]);

  // const deleteNode = useCallback(() => {
  //   setNodes((nodes) => nodes.filter((node) => node.id !== id));
  //   setEdges((edges) => edges.filter((edge) => edge.source !== id));
  // }, [id, setNodes, setEdges]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="bg-white border-solid shadow-xl absolute z-10"
      {...props}
    >
      <p style={{ margin: "0.5em" }}>10</p>
      <button>duplicate</button>
      <button>delete</button>
    </div>
  );
}
