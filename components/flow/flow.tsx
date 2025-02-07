import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
  Position,
} from "@xyflow/react";
import EditorNodeType from "./EditorNodeType";
import DrawNodeType from "./DrawNodeType";
import "@xyflow/react/dist/style.css";
import { useReactFlow } from "@xyflow/react";

const proOptions = { hideAttribution: true };

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: "1",
      toolbarPosition: Position.Top,
      content: `
<h2>
  Hi there,
</h2>
<p>
  This is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kinds of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
<div data-type="drag_item">
  Drag me!
</div>
`,
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
  useEffect(() => {
    // 在组件挂载后，查询 .react-flow__pane 元素
    const pane = document.querySelector(".react-flow__pane");

    if (pane) {
      // 每次滚动时调用该函数，将滚动位置重置
      const handleScroll = (e) => {
        e.currentTarget.scrollTo({ top: 0, left: 0, behavior: "instant" });
        console.log("滚动事件已处理，滚动位置已重置");
      };

      // 添加滚动事件监听器
      pane.addEventListener("scroll", handleScroll);

      // 组件卸载时，移除事件监听器，防止内存泄漏
      return () => {
        pane.removeEventListener("scroll", handleScroll);
      };
    } else {
      console.warn("未找到类名为 '.react-flow__pane' 的元素");
    }
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  //當滑鼠連續點擊兩次新增節點
  const handleAddNode = (event) => {
    if (event.target.classList[0] === "react-flow__pane") {
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;

      const newNode = {
        id: `${nodes.length + 1}`,
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
      >
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
