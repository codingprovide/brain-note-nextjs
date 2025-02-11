import { useCallback, useEffect, useRef } from "react";
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
} from "@xyflow/react";
import EditorNodeType from "./EditorNodeType";
import DrawNodeType from "./DrawNodeType";
import "@xyflow/react/dist/style.css";
import { v4 as uuid } from "uuid";

const proOptions = { hideAttribution: true };

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: "1",
      toolbarPosition: Position.Top,
      content: "",
    },
    type: "editorNode",
  },
  {
    id: "2",
    position: { x: 500, y: 100 },
    data: {
      label: "2",
      toolbarPosition: Position.Top,
    },
    type: "drawNode",
  },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const nodeTypes = { editorNode: EditorNodeType, drawNode: DrawNodeType };

export default function Flow() {
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
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

  //當滑鼠連續點擊兩次新增節點
  const handleAddNode = (event) => {
    if (event.target.classList[0] === "react-flow__pane") {
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;

      const newNode = {
        id: uuid(),
        position: screenToFlowPosition({ x: clientX, y: clientY }),
        data: {
          label: `${nodes.length + 1}`,
          toolbarPosition: Position.Top,
          content: "",
          nodes: nodes,
          setNodes: setNodes,
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
      </ReactFlow>
    </div>
  );
}
