import React, { useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getStroke } from "perfect-freehand";

// 手寫筆劃的參數設置
const options = {
  size: 5,
  thinning: 0.2,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => Math.sin(t * Math.PI * 0.5),
};

// 橡皮擦的參數設置
const eraserOptions = {
  size: 20,
  thinning: 0.1,
  smoothing: 0.5,
  streamline: 0.5,
};

export default function HandWritingCanvas() {
  const [buttonColor, setButtonColor] = useState("text-black"); // 記錄按鈕文字顏色
  const [penColor, setPenColor] = useState("black");
  const [drawingTool, setDrawingTool] = useState("Pen");
  const [lines, setLines] = useState([]); // 存放所有畫過的線條
  const [currentPoints, setCurrentPoints] = useState([]); // 當前繪製的線條座標點
  const [selectedIndex, setSelectedIndex] = useState(null); // 被選中的線條索引
  const [startPos, setStartPos] = useState(null); // 滑鼠點擊時的起始位置
  const [eraserSize, setEraserSize] = useState(15); // 橡皮擦大小

  // 判斷兩個點是否很接近（用於檢測碰撞）
  const isPointNearPoint = (p1, p2, threshold) => {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy) < threshold;
  };

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      if (drawingTool === "Pen") {
        // 檢查是否點擊到已經畫出的線條
        const clickedIndex = lines.findIndex((line) => {
          if (line.tool === "Eraser") return false; // 不選中橡皮擦痕跡
          
          const { x, y, points } = line;
          return points.some(([px, py]) => {
            const dx = e.evt.offsetX - (px + x);
            const dy = e.evt.offsetY - (py + y);
            return Math.sqrt(dx * dx + dy * dy) < 5; // 允許誤差範圍
          });
        });

        if (clickedIndex !== -1) {
          // 如果點擊到了線條，記錄索引並設置起始位置
          setSelectedIndex(clickedIndex);
          setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });
        } else {
          // 沒有選擇到任何線條，則開始新的筆劃
          setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
        }
      } else if (drawingTool === "Eraser") {
        // 橡皮擦模式，開始記錄橡皮擦的軌跡
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
      }
    }
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return;

    if (selectedIndex !== null) {
      // 移動已經選中的線條
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
      // 正在繪製新的筆劃或使用橡皮擦
      const newPoint = [e.evt.offsetX, e.evt.offsetY, e.evt.pressure];
      setCurrentPoints([...currentPoints, newPoint]);

      // 如果是橡皮擦模式，檢查是否碰到現有線條
      if (drawingTool === "Eraser") {
        setLines((prevLines) => {
          return prevLines.filter((line) => {
            if (line.tool === "Eraser") return true; // 不擦除橡皮擦痕跡
            
            // 檢查線條的每個點是否在橡皮擦範圍內
            const isErased = line.points.some(([px, py]) => {
              return isPointNearPoint(
                [px + line.x, py + line.y],
                [e.evt.offsetX, e.evt.offsetY],
                eraserSize
              );
            });
            
            // 如果碰到了，則移除該線條
            return !isErased;
          });
        });
      }
    }
  }

  useEffect(() => {
    console.log("lines:", lines);
  }, [lines]);

  function handlePointerUp() {
    if (selectedIndex !== null) {
      // 取消選擇的線條
      setSelectedIndex(null);
    } else if (currentPoints.length > 0) {
      // 新增新的筆劃
      if (drawingTool === "Pen") {
        setLines([
          ...lines,
          {
            tool: "Pen",
            points: currentPoints,
            x: 0,
            y: 0,
            color: penColor,
          },
        ]);
      } else if (drawingTool === "Eraser") {
        // 可以選擇是否保留橡皮擦的軌跡
        // 如果要顯示橡皮擦軌跡，可以取消下面這行註釋
        /*
        setLines([
          ...lines,
          {
            tool: "Eraser",
            points: currentPoints,
            x: 0,
            y: 0,
            color: "rgba(200, 200, 200, 0.5)", // 半透明灰色
          },
        ]);
        */
      }
      setCurrentPoints([]);
    }
  }

  function handleContextMenu(e) {
    e.evt.preventDefault(); // 阻止右鍵菜單
  }

  function toggleEraseMode() {
    setButtonColor((prevColor) =>
      prevColor === "text-black" ? "text-red-500" : "text-black"
    );
    setDrawingTool((prevTool) => (prevTool === "Pen" ? "Eraser" : "Pen"));
  }

  return (
    <div className="flex flex-col items-center p-4">
      {/* 橡皮擦按鈕 */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={toggleEraseMode}
          className={`px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${buttonColor}`}
        >
          {drawingTool === "Pen" ? "切換到橡皮擦" : "切換到畫筆"}
        </button>
        
        {drawingTool === "Eraser" && (
          <div className="flex items-center">
            <span className="mr-2">橡皮擦大小:</span>
            <input
              type="range"
              min="5"
              max="50"
              value={eraserSize}
              onChange={(e) => setEraserSize(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="ml-2">{eraserSize}px</span>
          </div>
        )}
      </div>
      
      {/* 繪圖區域 */}
      <Stage
        width={500}
        height={500}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="border border-gray-400 rounded-lg shadow-lg"
      >
        <Layer>
          {/* 繪製所有的筆劃 */}
          {lines.map((line, index) => (
            <Line
              key={index}
              points={getStroke(line.points, line.tool === "Eraser" ? eraserOptions : options).flatMap((p) => [p[0], p[1]])}
              fill={line.color}
              closed={true}
              stroke={line.color}
              strokeWidth={1}
              lineCap="round"
              lineJoin="round"
              x={line.x}
              y={line.y}
            />
          ))}

          {/* 畫當前筆劃 */}
          {currentPoints.length > 0 && (
            <>
              <Line
                points={getStroke(
                  currentPoints,
                  drawingTool === "Eraser" ? eraserOptions : options
                ).flatMap((p) => [p[0], p[1]])}
                fill={drawingTool === "Eraser" ? "rgba(200, 200, 200, 0.5)" : penColor}
                closed={true}
                stroke={drawingTool === "Eraser" ? "rgba(150, 150, 150, 0.8)" : penColor}
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
              />
              
              {/* 如果是橡皮擦模式，顯示橡皮擦的圓圈提示 */}
              {drawingTool === "Eraser" && currentPoints.length > 0 && (
                <Line
                  points={[...Array(36)].map((_, i) => {
                    const angle = (i * 10 * Math.PI) / 180;
                    const x = currentPoints[currentPoints.length - 1][0] + eraserSize * Math.cos(angle);
                    const y = currentPoints[currentPoints.length - 1][1] + eraserSize * Math.sin(angle);
                    return [x, y];
                  }).flat()}
                  stroke="rgba(100, 100, 100, 0.8)"
                  strokeWidth={1}
                  dash={[2, 2]}
                  closed={true}
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
}