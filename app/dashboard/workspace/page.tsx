"use client";
import { ReactFlowProvider } from "@xyflow/react";
import Flow from "@/components/flow/flow";

export default function WorkSpacePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
