import React, { useEffect, useRef } from "react";
import DragHandle from "@tiptap-pro/extension-drag-handle-react";
import { useCurrentEditor } from "@tiptap/react";
import { GripVertical } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { Instance as TippyInstance } from "tippy.js";

export default function DragHandleWrapper() {
  // 1. 取得 React Flow instance & 座標資訊
  const reactFlowInstance = useReactFlow();
  const {
    x: translateX,
    y: translateY,
    zoom: scale,
  } = reactFlowInstance.getViewport();

  // 2. 取得 Tiptap 的 Editor
  const { editor } = useCurrentEditor();

  // 3. 用來儲存 Tippy 實例的參考
  const tippyInstanceRef = useRef<TippyInstance | null>(null);

  /**
   * 監聽 Flow 的 x / y / zoom 改變
   * => 每次變動都強制 Tippy 重新計算位置
   */
  useEffect(() => {
    if (tippyInstanceRef.current) {
      tippyInstanceRef.current.popperInstance?.update();
    }
  }, [translateX, translateY, scale]);

  // 如果 editor 還沒 ready，就不渲染
  if (!editor) return null;

  return (
    <DragHandle
      editor={editor}
      tippyOptions={{
        // 讓我們以程式方式控制顯示
        trigger: "manual",
        // 初始化就顯示，方便開發測試
        showOnCreate: true,
        // placement 設左側，依需求可調整
        placement: "left",
        /**
         * 關鍵：指定要把 Tippy append 到 .react-flow__viewport，
         * 這樣它就會跟該容器一起被縮放和平移。
         */
        appendTo: () => {
          // 若找不到，就退回 body（避免 null）
          return (
            document.querySelector(".react-flow__viewport") || document.body
          );
        },
        /**
         * Tippy 計算位置時呼叫的函式：
         * 先用 editor.view.coordsAtPos 取得螢幕座標，
         * 然後再用 reactFlowInstance.project(...) 轉換成 Flow 座標。
         */
        getReferenceClientRect: () => {
          const selection = editor.state.selection;
          // 若沒有選取，回傳空
          if (!selection || selection.empty) {
            return new DOMRect(0, 0, 0, 0);
          }

          // 取得該文字在螢幕座標系的 left, top, right, bottom
          const { left, right, top, bottom } = editor.view.coordsAtPos(
            selection.from
          );
          const width = right - left;
          const height = bottom - top;

          // 使用 reactFlowInstance.project 把螢幕座標 => Flow 內部座標
          const p1 = reactFlowInstance.screenToFlowPosition({
            x: left,
            y: top,
          });
          const p2 = reactFlowInstance.screenToFlowPosition({
            x: right,
            y: bottom,
          });

          // Flow 座標的寬高
          const flowWidth = p2.x - p1.x;
          const flowHeight = p2.y - p1.y;

          // 回傳 Flow 座標的 DOMRect
          return new DOMRect(p1.x, p1.y, flowWidth, flowHeight);
        },
        /**
         * 建立 Tippy 後，把實例存在 ref，之後可隨時呼叫 .update() / .show() / .hide()
         */
        onCreate(instance) {
          tippyInstanceRef.current = instance;
        },
      }}
    >
      {/* 這裡就是拖曳手把的 UI，隨需求自行設計 */}
      <div className="relative top-0 right-0 h-full rounded-l-lg cursor-grab flex items-center justify-center">
        <GripVertical />
      </div>
    </DragHandle>
  );
}
