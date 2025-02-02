// DragItem.ts
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import DragItemComponent from "./DragItemComponent";

const DragItem = Node.create({
  name: "drag_item",
  group: "block",
  draggable: true,
  content: "paragraph+",
  parseHTML() {
    return [
      {
        tag: 'div[data-type="drag_item"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "drag_item" }),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(DragItemComponent);
  },
});

export default DragItem;
