import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { getStroke } from "perfect-freehand";
import {
  usePaintToolBarStore,
  PaintToolBarState,
} from "@/store/paint-tool-bar-store";
import { useDropDownStore, DropDownState } from "@/store/drop-down-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReactFlow, NodeResizer, useNodeId } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { Handle, HandleType, Position } from "@xyflow/react";

interface DrawLine {
  points: [number, number, number][];
  x: number;
  y: number;
  tool: string;
  color: string;
  strokeWidth: number;
}

const options = {
  size: 3,
  thinning: 0.2,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t: number) => Math.sin(t * Math.PI * 0.5),
};

interface handleProps {
  id: string;
  position: Position;
  type: HandleType;
}

const handles: handleProps[] = [
  { id: "source-left", position: Position.Left, type: "source" },
  { id: "target-left", position: Position.Left, type: "target" },
  { id: "source-right", position: Position.Right, type: "source" },
  { id: "target-right", position: Position.Right, type: "target" },
  { id: "source-top", position: Position.Top, type: "source" },
  { id: "target-top", position: Position.Top, type: "target" },
  { id: "source-bottom", position: Position.Bottom, type: "source" },
  { id: "target-bottom", position: Position.Bottom, type: "target" },
];

const HandWritingCanvas = memo(function HandWritingCanvas({
  selected,
  isConnectable,
  data,
}: {
  selected: boolean;
  isConnectable: boolean;
  data: { content: DrawLine[] | undefined; html: string | undefined };
}) {
  const [lines, setLines] = useState<DrawLine[]>(() => {
    if (!data.content) {
      return [];
    }
    return data.content;
  });
  const [currentPoints, setCurrentPoints] = useState<
    [number, number, number][]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const { paintTool } = usePaintToolBarStore<PaintToolBarState>(
    (state) => state
  );
  const { toolColor, stroke } = useDropDownStore<DropDownState>(
    (state) => state
  );
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 300, height: 300 });
  const [isResize, setIsResize] = useState(false);
  const [cardSize, setCardSize] = useState({ width: 500, height: 500 });
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();

  useEffect(() => {
    setStageSize({
      width: cardSize.width - 74,
      height: cardSize.height - 74,
    });
  }, [cardSize]);

  const handleContentChange = useCallback(
    (content: DrawLine[]) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, content } }
            : node
        )
      );
    },
    [nodeId, setNodes]
  );

  useEffect(() => {
    handleContentChange(lines);
  }, [lines, handleContentChange]);

  function handlePointerDown(e: {
    evt: {
      preventDefault: () => void;
      buttons: number;
      offsetX: number;
      offsetY: number;
      pressure: number;
    };
  }) {
    if (isResize) return; // 當在調整大小時，不處理其他 pointerDown 事件
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      if (paintTool === "Move") {
        // 只有在 Move 模式下才檢查線條是否被點擊
        const clickedIndex = lines.findIndex((line) => {
          if (line.tool === "Eraser") return false;
          const { x, y, points } = line;
          return points.some(([px, py]) => {
            const dx = e.evt.offsetX - (px + x);
            const dy = e.evt.offsetY - (py + y);
            return Math.sqrt(dx * dx + dy * dy) < 5;
          });
        });

        if (clickedIndex !== -1) {
          setSelectedIndex(clickedIndex);
          setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });
        } else {
          setCurrentPoints([]);
        }
      } else {
        // 在非 Move 模式下，處理繪製或擦除
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
      }
    }
  }

  function handlePointerMove(e: {
    evt: {
      buttons: number;
      offsetX: number;
      offsetY: number;
      pressure: number;
    };
  }) {
    if (isResize) return; // 當在調整大小時，不處理其他 pointerDown 事件
    if (e.evt.buttons !== 1) return;

    if (selectedIndex !== null && startPos && paintTool === "Move") {
      // 只有在 Move 模式下才能移動線條
      const dx = e.evt.offsetX - startPos.x;
      const dy = e.evt.offsetY - startPos.y;
      setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });

      setLines((prevLines) => {
        const newLines = [...prevLines];
        newLines[selectedIndex] = {
          ...newLines[selectedIndex],
          x: newLines[selectedIndex].x + dx,
          y: newLines[selectedIndex].y + dy,
        };
        return newLines;
      });
    } else {
      setCurrentPoints((prevPoints) => [
        ...prevPoints,
        [e.evt.offsetX, e.evt.offsetY, e.evt.pressure],
      ]);
    }
  }

  function handlePointerUp() {
    if (isResize) return; // 當在調整大小時，不處理其他 pointerDown 事件
    if (selectedIndex !== null) {
      setSelectedIndex(null);
    } else if (currentPoints.length > 0 && paintTool !== "Move") {
      if (paintTool === "Eraser") {
        const eraserOptions = {
          ...options,
          size: 20,
          thinning: 0,
          easing: (t: number) => t,
        };
        const eraserPoints = getStroke(currentPoints, eraserOptions) || [];

        setLines((prevLines) => {
          return prevLines.filter((line) => {
            if (line.tool === "Eraser") return true;

            const linePoints = getStroke(line.points, options) || [];

            for (const linePoint of linePoints) {
              for (const eraserPoint of eraserPoints) {
                const dx = linePoint[0] + line.x - eraserPoint[0];
                const dy = linePoint[1] + line.y - eraserPoint[1];
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < eraserOptions.size * 1.2) {
                  return false;
                }
              }
            }
            return true;
          });
        });
      } else {
        setLines((prevLines) => [
          ...prevLines,
          {
            points: currentPoints,
            x: 0,
            y: 0,
            tool: paintTool,
            color: toolColor,
            strokeWidth: stroke,
          },
        ]);
      }
      setCurrentPoints([]);
    }
  }

  function handleContextMenu(e: { evt: { preventDefault: () => void } }) {
    e.evt.preventDefault();
  }

  // 刪除節點
  const handleDeleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  }, [nodeId, setNodes]);

  return (
    <Card
      className=" min-h-52 min-w-52 "
      style={{ width: cardSize.width, height: cardSize.height }}
    >
      {/* Header with Delete Button */}
      <CardHeader className="w-full p-1 rounded-t-xl  hover:bg-gray-100 flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="p-1 w-8 h-8"
                onClick={handleDeleteNode}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete the Node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent className="overflow-hidden">
        <NodeResizer
          minWidth={200}
          minHeight={200}
          isVisible={selected}
          lineClassName="border border-[0.5px] border-transparent"
          handleClassName="bg-transparent border-transparent"
          onResizeStart={() => setIsResize(true)}
          onResize={(event, params) => {
            if (containerRef.current) {
              setCardSize({ width: params.width, height: params.height });
            }
          }}
          onResizeEnd={() => {
            setIsResize(false);
          }}
        />

        {handles.map((handle) => (
          <Handle
            key={handle.id}
            id={handle.id}
            type={handle.type}
            position={handle.position}
            isConnectable={isConnectable}
            className="w-2 h-2 border border-[#cbd5e1] bg-white hover:w-6 hover:h-6"
          />
        ))}
        <div ref={containerRef} className="w-full h-full">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onContextMenu={handleContextMenu}
            className="border border-gray-400 rounded-lg shadow-lg m-3"
          >
            <Layer>
              {lines.map((line, index) => {
                const strokePoints =
                  getStroke(
                    line.points,
                    line.tool === "Eraser"
                      ? { ...options, size: 20, thinning: 0, easing: (t) => t }
                      : options
                  ) || [];
                return (
                  <Line
                    key={index}
                    points={strokePoints.flatMap((p) => [p[0], p[1]])}
                    fill={line.color}
                    closed={true}
                    stroke={line.color}
                    strokeWidth={line.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                    x={line.x}
                    y={line.y}
                  />
                );
              })}

              {currentPoints.length > 0 && (
                <Line
                  points={
                    getStroke(
                      currentPoints,
                      paintTool === "Eraser"
                        ? {
                            ...options,
                            size: 20,
                            thinning: 0,
                            easing: (t) => t,
                          }
                        : options
                    ).flatMap((p) => [p[0], p[1]]) || []
                  }
                  fill={
                    paintTool === "Eraser" || paintTool === "Move"
                      ? "transparent"
                      : toolColor
                  }
                  closed={true}
                  stroke={
                    paintTool === "Eraser" || paintTool === "Move"
                      ? "transparent"
                      : toolColor
                  }
                  strokeWidth={stroke}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </Layer>
          </Stage>
        </div>
      </CardContent>
    </Card>
  );
});
export default HandWritingCanvas;
