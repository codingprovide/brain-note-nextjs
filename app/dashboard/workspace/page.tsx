"use client";
import { ReactFlowProvider } from "@xyflow/react";
import Flow from "@/components/flow/flow";

export default function WorkSpacePage() {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
