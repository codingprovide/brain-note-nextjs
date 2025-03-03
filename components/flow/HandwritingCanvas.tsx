import React, { useState } from "react";
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
  size: 20, // 橡皮擦尺寸比筆大
  thinning: 0,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => t,
};

export default function HandWritingCanvas() {
  const [buttonColor, setButtonColor] = useState("text-black"); // 按鈕顏色
  const [drawingTool, setDrawingTool] = useState("Pen"); // 當前工具：Pen 或 Eraser
  const [lines, setLines] = useState([]); // 已繪製的線條
  const [currentPoints, setCurrentPoints] = useState([]); // 當前繪製的線條點
  const [selectedIndex, setSelectedIndex] = useState(null); // 被選中的線條索引
  const [startPos, setStartPos] = useState(null); // 滑鼠點擊的起始位置

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      if (drawingTool === "Pen") {
        // 檢查是否點擊到已經畫出的線條
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
          setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
        }
      } else {
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
      }
    }
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return;

    if (selectedIndex !== null && startPos) {
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
      setCurrentPoints((prevPoints) => [...prevPoints, [e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
    }
  }

  function handlePointerUp() {
    if (selectedIndex !== null) {
      setSelectedIndex(null);
    } else if (currentPoints.length > 0) {
      if (drawingTool === "Pen") {
        setLines((prevLines) => [
          ...prevLines,
          { points: currentPoints, x: 0, y: 0, tool: "Pen", color: "black" },
        ]);
      } else {
        const eraserPoints = getStroke(currentPoints, eraserOptions) || [];

        setLines((prevLines) => {
          return prevLines.filter((line) => {
            if (line.tool === "Eraser") return true;
            
            const linePoints = getStroke(line.points, options) || [];

            for (const linePoint of linePoints) {
              for (const eraserPoint of eraserPoints) {
                const dx = (linePoint[0] + line.x) - eraserPoint[0];
                const dy = (linePoint[1] + line.y) - eraserPoint[1];
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < eraserOptions.size * 1.2) {
                  return false;
                }
              }
            }
            return true;
          });
        });
      }
      setCurrentPoints([]);
    }
  }

  function handleContextMenu(e) {
    e.evt.preventDefault();
  }

  function toggleEraseMode() {
    setButtonColor((prevColor) => (prevColor === "text-black" ? "text-blue-500" : "text-black"));
    setDrawingTool((prevTool) => (prevTool === "Pen" ? "Eraser" : "Pen"));
  }

  return (
    <div className="flex flex-col items-center p-4">
      {/* 工具切換按鈕 */}
      <button
        onClick={toggleEraseMode}
        className={`px-4 py-2 mb-4 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${buttonColor}`}
      >
        {drawingTool === "Pen" ? "橡皮擦" : "畫筆"}
      </button>

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
          {lines.map((line, index) => {
            const strokePoints = getStroke(line.points, line.tool === "Eraser" ? eraserOptions : options) || [];
            return (
              <Line
                key={index}
                points={strokePoints.flatMap((p) => [p[0], p[1]])}
                fill={line.color}
                closed={true}
                stroke={line.color}
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
                x={line.x}
                y={line.y}
              />
            );
          })}

          {/* 畫當前筆劃 */}
          {currentPoints.length > 0 && (
            <Line
              points={getStroke(currentPoints, drawingTool === "Eraser" ? eraserOptions : options)
                .flatMap((p) => [p[0], p[1]]) || []}
              fill={drawingTool === "Eraser" ? "rgba(240, 240, 240, 0.5)" : "black"}
              closed={true}
              stroke={drawingTool === "Eraser" ? "rgba(240, 240, 240, 0.5)" : "black"}
              strokeWidth={1}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
