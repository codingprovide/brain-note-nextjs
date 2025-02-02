// DragItemComponent.tsx
import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

const DragItemComponent: React.FC = () => {
  return (
    <NodeViewWrapper
      as="div"
      data-type="drag_item"
      contentEditable={false}
      style={{
        display: "flex",
        padding: "0.5rem",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        marginBottom: "0.5rem",
        borderRadius: "6px",
      }}
    >
      {/* 可编辑内容区域 */}
      <NodeViewContent
        as="div"
        contentEditable={true}
        style={{ flex: "1 1 auto" }}
      />
      {/* 拖拽手柄 */}
      <div
        data-drag-handle
        style={{ flex: "0 0 auto", marginLeft: "auto", cursor: "move" }}
      >
        
      </div>
    </NodeViewWrapper>
  );
};

export default DragItemComponent;
