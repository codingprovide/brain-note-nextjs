import React, { useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getStroke } from "perfect-freehand";
import { FaPencilAlt, FaHighlighter } from "react-icons/fa";
import { PiEraserFill } from "react-icons/pi";
import { BsCursor } from "react-icons/bs";

// 手寫筆劃的參數設置
const options = {
  size: 5, // 筆劃大小
  thinning: 0.2, // 筆劃變細程度
  smoothing: 0.99, // 平滑度
  streamline: 0.99, // 流線化程度
  easing: (t) => Math.sin(t * Math.PI * 0.5), // 緩動函數
};

// 橡皮擦的參數設置
const eraserOptions = {
  size: 10, 
  thinning: 0, 
  smoothing: 0.99, 
  streamline: 0.99,
  easing: (t) => t, 
};

export default function HandWritingCanvas() {
  const [drawingTool, setDrawingTool] = useState("Pen"); 
  const [lines, setLines] = useState([]); 
  const [currentPoints, setCurrentPoints] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null); 
  const [color, setColor] = useState("black");
  const [size, setSize] = useState(5); 
  const [showPenOptions, setShowPenOptions] = useState(false); 
  const [showHighlightOptions, setShowHighlightOptions] = useState(false); 

  const buttonstyle ="px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100"

  // 更新筆劃參數的函數
  const updateOptions = (newSize) => ({
    ...options,
    size: newSize,
  });

  // 處理滑鼠或觸控按下的動作
  function handlePointerDown(e) {
    e.evt.preventDefault();
    if (e.evt.buttons === 1) { 
      if (drawingTool === "Move") { 
        const clickedIndex = lines.findIndex((line) => {
          if (line.tool === "Eraser") return false; // 橡皮擦線條不可移動
          const { x, y, points } = line;
          return points.some(([px, py]) => {
            const dx = e.evt.offsetX - (px + x);
            const dy = e.evt.offsetY - (py + y);
            return Math.sqrt(dx * dx + dy * dy) < 5; // 點擊範圍檢測
          });
        });
        if (clickedIndex !== -1) {
          setSelectedIndex(clickedIndex); // 選中線條
          setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY }); // 記錄起始位置
        } else {
          setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]); 
        }
      } else {
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
      }
    }
  }

  // 處理滑鼠或觸控移動的動作
  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return; // 未按下左鍵時不處理
    if (selectedIndex !== null && startPos) { // 移動選中的線條
      const dx = e.evt.offsetX - startPos.x;
      const dy = e.evt.offsetY - startPos.y;
      setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY }); // 更新起始位置
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
      setCurrentPoints((prevPoints) => [...prevPoints, [e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]); // 添加新點
    }
  }

  // 處理滑鼠或觸控放開的動作
  function handlePointerUp() {
    if (selectedIndex !== null) {
      setSelectedIndex(null); // 取消選中
    } else if (currentPoints.length > 0 && drawingTool !== "Move") {
      if (drawingTool === "Pen" || drawingTool === "Highlight") { 
        setLines((prevLines) => [
          ...prevLines,
          { points: currentPoints, x: 0, y: 0, tool: drawingTool, color, size }, // 添加新線條
        ]);
      } else if (drawingTool === "Eraser") { // 橡皮擦模式
        const eraserPoints = getStroke(currentPoints, eraserOptions) || [];
        setLines((prevLines) => {
          return prevLines.filter((line) => {
            if (line.tool === "Eraser") return true; // 保留橡皮擦線條
            const linePoints = getStroke(line.points, updateOptions(line.size)) || [];
            for (const linePoint of linePoints) {
              for (const eraserPoint of eraserPoints) {
                const dx = (linePoint[0] + line.x) - eraserPoint[0];
                const dy = (linePoint[1] + line.y) - eraserPoint[1];
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < eraserOptions.size * 1.2) { // 擦除範圍檢測
                  return false; // 移除線條
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

  // 禁用右鍵選單
  function handleContextMenu(e) {
    e.evt.preventDefault();
  }

  function togglePenMode() {
    setDrawingTool("Pen");
    setShowPenOptions(!showPenOptions);
    setShowHighlightOptions(false);
  }

  function toggleHighlightMode() {
    setDrawingTool("Highlight");
    setShowHighlightOptions(!showHighlightOptions);
    setShowPenOptions(false);
  }

  function toggleEraseMode() {
    setDrawingTool("Eraser");
    setShowPenOptions(false);
    setShowHighlightOptions(false);
  }

  function toggleMoveMode() {
    setDrawingTool("Move");
    setShowPenOptions(false);
    setShowHighlightOptions(false);
  }

  const handleColorSelect = (newColor) => {
    setColor(newColor);
  };

  const handleSizeSelect = (newSize) => {
    setSize(newSize);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex flex-row items-start p-4 space-x-4">
        <div className="relative flex flex-col items-center">
          <button
            onClick={togglePenMode}
            className={`${buttonstyle} ${
              drawingTool === "Pen" ? "text-blue-500" : "text-black"
            }`}
          >
            <FaPencilAlt />
          </button>
          {showPenOptions && (
            <div className="absolute top-full mt-2 p-2 bg-gray-100 rounded-lg shadow-md z-10">
              <div className="flex space-x-2 mb-2">
                <button
                  className="w-6 h-6 rounded-full bg-black"
                  onClick={() => handleColorSelect("black")}
                />
                <button
                  className="w-6 h-6 rounded-full bg-red-500"
                  onClick={() => handleColorSelect("red")}
                />
                <button
                  className="w-6 h-6 rounded-full bg-blue-500"
                  onClick={() => handleColorSelect("blue")}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => handleSizeSelect(3)}
                >
                  細
                </button>
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => handleSizeSelect(5)}
                >
                  中
                </button>
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => handleSizeSelect(10)}
                >
                  粗
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center">
          <button
            onClick={toggleHighlightMode}
            className={`${buttonstyle} ${
              drawingTool === "Highlight" ? "text-blue-500" : "text-black"
            }`}
          >
            <FaHighlighter />
          </button>
          {showHighlightOptions && (
            <div className="absolute top-full mt-2 p-2 bg-gray-100 rounded-lg shadow-md z-10">
              <div className="flex space-x-2 mb-2">
                <button
                  className="w-6 h-6 rounded-full bg-yellow-500 opacity-70"
                  onClick={() => handleColorSelect("rgba(255, 255, 0, 0.7)")}
                />
                <button
                  className="w-6 h-6 rounded-full bg-green-500 opacity-70"
                  onClick={() => handleColorSelect("rgba(0, 255, 0, 0.7)")}
                />
                <button
                  className="w-6 h-6 rounded-full bg-orange-500 opacity-70"
                  onClick={() => handleColorSelect("rgba(255, 165, 0, 0.7)")}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => handleSizeSelect(3)}
                >
                  細
                </button>
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => handleSizeSelect(5)}
                >
                  中
                </button>
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => handleSizeSelect(10)}
                >
                  粗
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleEraseMode}
          className={`${buttonstyle} ${
            drawingTool === "Eraser" ? "text-blue-500" : "text-black"
          }`}
        >
          <PiEraserFill />
        </button>
        <button
          onClick={toggleMoveMode}
          className={`${buttonstyle} ${
            drawingTool === "Move" ? "text-blue-500" : "text-black"
          }`}
        >
          <BsCursor />
        </button>
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
          {lines.map((line, index) => {
            const strokePoints = getStroke(line.points, line.tool === "Eraser" ? eraserOptions : updateOptions(line.size)) || [];
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
          {currentPoints.length > 0 && (
            <Line
              points={getStroke(currentPoints, drawingTool === "Eraser" ? eraserOptions : updateOptions(size))
                .flatMap((p) => [p[0], p[1]]) || []} // 當前線條的點
              fill={drawingTool === "Eraser" || drawingTool === "Move" ? "transparent" : color} 
              closed={true} 
              stroke={drawingTool === "Eraser" || drawingTool === "Move" ? "transparent" : color}
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