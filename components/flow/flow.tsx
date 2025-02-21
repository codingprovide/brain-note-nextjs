import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
  reconnectEdge,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import type { Edge, Connection, ReactFlowInstance } from "@xyflow/react";
import EditorNodeType from "./EditorNodeType";
// import DrawNodeType from "./DrawNodeType";
import "@xyflow/react/dist/style.css";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { EditorNodePropsType } from "@/types/types";
import { serverSignOut } from "@/app/actions/auth";
import { LoaderCircle } from "lucide-react";

const proOptions = { hideAttribution: true };

const initialNodes: EditorNodePropsType[] = [];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const nodeTypes = { editorNode: EditorNodeType };

export default function Flow() {
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    EditorNodePropsType,
    { id: string; source: string; target: string }
  > | null>(null);

  const { screenToFlowPosition, setViewport } = useReactFlow();
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );

  const onReconnectEnd = useCallback(
    (_: unknown, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }

      edgeReconnectSuccessful.current = true;
    },
    [setEdges]
  );

  const onSave = useCallback(async () => {
    if (!rfInstance) return;
    setIsSaving(true); // 開始 Loading

    try {
      const flow = rfInstance.toObject();
      const response = await fetch("/api/note/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flowData: flow, // 存入 Prisma `Json` 字段
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log("Flow saved successfully");
    } catch (error) {
      console.error("Failed to save flow:", error);
    } finally {
      setIsSaving(false); // 請求完成後關閉 Loading
    }
  }, [rfInstance]);

  const onRestore = useCallback(async () => {
    setIsRestoring(true); // 開始 Loading
    try {
      const response = await fetch("/api/note/get");
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.flowData) {
        const flow = data.flowData;
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;

        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    } catch (error) {
      console.error("Failed to load flow:", error);
    } finally {
      setIsRestoring(false); // 請求完成後關閉 Loading
    }
  }, [setNodes, setEdges, setViewport]);

  //當滑鼠連續點擊兩次新增節點
  const handleAddNode = (
    event:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) => {
    if ((event.target as Element).classList.contains("react-flow__pane")) {
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;

      const newNode = {
        id: uuid(),
        position: screenToFlowPosition({ x: clientX, y: clientY }),
        data: {
          content: undefined,
          html: undefined,
        },
        type: "editorNode",
      };

      setNodes((nds) => [...nds, newNode]);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        onInit={(flowInstance) => setRfInstance(flowInstance)}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={proOptions}
        nodeTypes={nodeTypes}
        minZoom={0.1}
        onDoubleClick={(event) => {
          handleAddNode(event);
        }}
        //用戶可以一次選擇多個節點
        selectionOnDrag
        //設定滑鼠的鍵位來拖曳1:左鍵 2:中鍵
        panOnDrag={[1, 2]}
        //設定部分位於選區內的節點也會被選取
        selectionMode={SelectionMode.Partial}
        //停用雙擊畫布進行縮放的功能
        zoomOnDoubleClick={false}
        style={{ backgroundColor: "#e5e7eb" }}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        panOnScroll
      >
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button onClick={onRestore} disabled={isRestoring}>
            {isRestoring ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isRestoring ? "Restoring..." : "Restore"}
          </Button>
          <Button onClick={() => serverSignOut()}>sign out</Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
