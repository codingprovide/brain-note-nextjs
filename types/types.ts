import { XYPosition } from "@xyflow/react";
import { JSONContent } from "@tiptap/react";
export interface EditorNodePropsType {
  id: string;
  position: XYPosition;
  data: {
    content: JSONContent | undefined;
  };
  type: string;
}
