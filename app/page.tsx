"use client";
import { ReactFlowProvider } from "@xyflow/react";
import Flow from "../components/flow/flow";

export default function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
