import React, { useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getStroke } from "perfect-freehand";

const options = {
  size: 5,
  thinning: 0.2,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => Math.sin(t * Math.PI * 0.5),
};

export default function HandWritingCanvas() {
  const [buttonColor, setButtonColor] = useState("text-black");
  const [penColor, setPenColor] = useState("black");
  const [drawingTool, setDrawingTool] = useState("Pen");
  const [lines, setLines] = useState([]);
  const [penLines, setPenLines] = useState([]);
  const [eraserLines, setEraserLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null);

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (isDraggingMode) {
      // 拖移模式：選取線條
      const clickedIndex = lines.findIndex((line) =>
        line.points.some(([px, py]) => {
          const dx = e.evt.offsetX - (px + (line.x || 0));
          const dy = e.evt.offsetY - (py + (line.y || 0));
          return Math.sqrt(dx * dx + dy * dy) < 10; // 允許誤差範圍
        })
      );

      if (clickedIndex !== -1) {
        setSelectedIndex(clickedIndex);
        setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });
      }
    } else if (e.evt.buttons === 1) {
      // 繪圖模式
      setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
    }
  }

  function handlePointerMove(e) {
    if (isDraggingMode && selectedIndex !== null) {
      // 拖移模式：移動選中的線條
      const dx = e.evt.offsetX - startPos.x;
      const dy = e.evt.offsetY - startPos.y;
      setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });

      setLines((prevLines) =>
        prevLines.map((line, index) =>
          index === selectedIndex ? { ...line, x: (line.x || 0) + dx, y: (line.y || 0) + dy } : line
        )
      );
    } else if (!isDraggingMode && e.evt.buttons === 1) {
      // 繪圖模式
      setCurrentPoints([...currentPoints, [e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
    }
  }

  function handlePointerUp() {
    if (isDraggingMode) {
      setSelectedIndex(null);
    } else if (currentPoints.length > 0) {
      if (drawingTool === "Pen") {
        const newPenLine = { points: currentPoints, x: 0, y: 0, color: penColor };
        setPenLines([...penLines, newPenLine]);
        setLines([...lines, newPenLine]);
      } else {
        const newEraserLine = { points: currentPoints, x: 0, y: 0, color: "#e5e7eb" };
        setEraserLines([...eraserLines, newEraserLine]);

        // 進行局部擦除
        const updatedPenLines = penLines.flatMap((penLine) => erasePenLine(penLine, newEraserLine));
        setPenLines(updatedPenLines);
        setLines([...updatedPenLines, newEraserLine]);
      }
      setCurrentPoints([]);
    }
  }

  function erasePenLine(penLine, eraserLine) {
    let remainingSegments = [];
    let currentSegment = [];
  
    for (let i = 0; i < penLine.points.length; i++) {
      const [px, py] = penLine.points[i];
  
      // 檢查這個點是否被擦除
      const isErased = eraserLine.points.some(([ex, ey]) => {
        const dx = px - ex;
        const dy = py - ey;
        return Math.sqrt(dx * dx + dy * dy) < 5; // 擦除範圍可調整
      });
  
      if (!isErased) {
        currentSegment.push([px, py]);
      } else if (currentSegment.length > 0) {
        // 被擦除時，把當前累積的線段存起來
        remainingSegments.push(currentSegment);
        currentSegment = [];
      }
    }
  
    if (currentSegment.length > 0) {
      remainingSegments.push(currentSegment);
    }
  
    return remainingSegments.map((seg) => ({
      points: seg,
      x: 0,
      y: 0,
      color: penLine.color,
    }));
  }
  

  function handleContextMenu(e) {
    e.evt.preventDefault();
  }

  function toggleEraseMode() {
    setButtonColor((prevColor) => (prevColor === "text-black" ? "text-blue-500" : "text-black"));
    setPenColor((prevColor) => (prevColor === "black" ? "#e5e7eb" : "black"));
    setDrawingTool((prevTool) => (prevTool === "Pen" ? "Eraser" : "Pen"));
  }

  function toggleDragMode() {
    setIsDraggingMode((prevMode) => !prevMode);
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex gap-2">
        <button
          onClick={toggleEraseMode}
          className={`px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${buttonColor}`}
        >
          橡皮擦
        </button>
        <button
          onClick={toggleDragMode}
          className={`px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 ${
            isDraggingMode ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          拖移
        </button>
      </div>
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
          {lines.map((line, index) => (
            <Line
              key={index}
              points={getStroke(line.points, options).flatMap((p) => [p[0], p[1]])}
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
          {currentPoints.length > 0 && !isDraggingMode && (
            <Line
              points={getStroke(currentPoints, options).flatMap((p) => [p[0], p[1]])}
              fill={penColor}
              closed={true}
              stroke={penColor}
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
