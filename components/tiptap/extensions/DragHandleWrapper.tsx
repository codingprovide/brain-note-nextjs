import DragHandle from "@tiptap-pro/extension-drag-handle-react";
import { useCurrentEditor } from "@tiptap/react";
import { GripVertical } from "lucide-react";

export default function DragHandleWrapper() {
  const { editor } = useCurrentEditor();
  if (!editor) return null;

  return (
    <DragHandle editor={editor} tippyOptions={{ placement: "left" }}>
      <div className=" relative top-0 right-0  h-full rounded-l-lg cursor-grab flex items-center justify-center">
        <GripVertical className="" />
      </div>
    </DragHandle>
  );
}
