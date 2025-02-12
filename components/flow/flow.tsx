import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
  Position,
  reconnectEdge,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import EditorNodeType from "./EditorNodeType";
import DrawNodeType from "./DrawNodeType";
import "@xyflow/react/dist/style.css";
import { v4 as uuid } from "uuid";
import { Button } from "../ui/Button";

const proOptions = { hideAttribution: true };

const initialNodes = [];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const nodeTypes = { editorNode: EditorNodeType, drawNode: DrawNodeType };
const flowKey = "example-flow";

export default function Flow() {
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<any>(null);

  const { screenToFlowPosition, setViewport } = useReactFlow();
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const stored = localStorage.getItem(flowKey);
      const flow = stored ? JSON.parse(stored) : null;

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport, setEdges]);

  //當滑鼠連續點擊兩次新增節點
  const handleAddNode = (event) => {
    if (event.target.classList.contains("react-flow__pane")) {
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;

      const newNode = {
        id: uuid(),
        position: screenToFlowPosition({ x: clientX, y: clientY }),
        data: {
          content: "",
        },
        type: "editorNode",
      };

      setNodes((nds) => [...nds, newNode]);
      console.log("New node added!");
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
        style={{ backgroundColor: "#F7F9FB" }}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
      >
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <Button onClick={onSave}>save</Button>
          <Button onClick={onRestore}>restore</Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
