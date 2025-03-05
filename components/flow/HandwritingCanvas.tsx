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
  size: 10, // 橡皮擦大小
  thinning: 0, // 無變細效果
  smoothing: 0.99, // 平滑度
  streamline: 0.99, // 流線化程度
  easing: (t) => t, // 線性緩動函數
};

export default function HandWritingCanvas() {
  const [drawingTool, setDrawingTool] = useState("Pen"); // 當前繪圖工具（默認為筆）
  const [lines, setLines] = useState([]); // 儲存所有繪製的線條
  const [currentPoints, setCurrentPoints] = useState([]); // 當前正在繪製的點
  const [selectedIndex, setSelectedIndex] = useState(null); // 被選中的線條索引
  const [startPos, setStartPos] = useState(null); // 移動時的起始位置
  const [color, setColor] = useState("black"); // 當前顏色
  const [size, setSize] = useState(5); // 當前筆劃大小
  const [showPenOptions, setShowPenOptions] = useState(false); // 是否顯示筆的選項
  const [showHighlightOptions, setShowHighlightOptions] = useState(false); // 是否顯示螢光筆的選項

  // 更新筆劃參數的函數
  const updateOptions = (newSize) => ({
    ...options,
    size: newSize,
  });

  // 處理滑鼠或觸控按下的動作
  function handlePointerDown(e) {
    e.evt.preventDefault();
    if (e.evt.buttons === 1) { // 左鍵按下
      if (drawingTool === "Move") { // 移動模式
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
          setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]); // 開始新線條
        }
      } else {
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]); // 開始新線條
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
          x: newLines[selectedIndex].x + dx, // 更新X座標
          y: newLines[selectedIndex].y + dy, // 更新Y座標
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
      if (drawingTool === "Pen" || drawingTool === "Highlight") { // 筆或螢光筆模式
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
      setCurrentPoints([]); // 清空當前點
    }
  }

  // 禁用右鍵選單
  function handleContextMenu(e) {
    e.evt.preventDefault();
  }

  // 切換到筆模式並顯示選項
  function togglePenMode() {
    setDrawingTool("Pen");
    setShowPenOptions(!showPenOptions);
    setShowHighlightOptions(false);
  }

  // 切換到螢光筆模式並顯示選項
  function toggleHighlightMode() {
    setDrawingTool("Highlight");
    setShowHighlightOptions(!showHighlightOptions);
    setShowPenOptions(false);
  }

  // 切換到橡皮擦模式
  function toggleEraseMode() {
    setDrawingTool("Eraser");
    setShowPenOptions(false);
    setShowHighlightOptions(false);
  }

  // 切換到移動模式
  function toggleMoveMode() {
    setDrawingTool("Move");
    setShowPenOptions(false);
    setShowHighlightOptions(false);
  }

  // 處理顏色選擇
  const handleColorSelect = (newColor) => {
    setColor(newColor);
  };

  // 處理筆劃大小選擇
  const handleSizeSelect = (newSize) => {
    setSize(newSize);
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* 工具切換按鈕 */}
      <div className="flex flex-row items-start p-4 space-x-4">
        <div className="relative flex flex-col items-center">
          <button
            onClick={togglePenMode}
            className={`px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${
              drawingTool === "Pen" ? "text-blue-500" : "text-black"
            }`}
          >
            <FaPencilAlt /> {/* 筆圖標 */}
          </button>
          {showPenOptions && (
            <div className="absolute top-full mt-2 p-2 bg-gray-100 rounded-lg shadow-md z-10">
              <div className="flex space-x-2 mb-2">
                {/* 筆的顏色選擇 */}
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
                {/* 筆的大小選擇 */}
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
            className={`px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${
              drawingTool === "Highlight" ? "text-blue-500" : "text-black"
            }`}
          >
            <FaHighlighter /> {/* 螢光筆圖標 */}
          </button>
          {showHighlightOptions && (
            <div className="absolute top-full mt-2 p-2 bg-gray-100 rounded-lg shadow-md z-10">
              <div className="flex space-x-2 mb-2">
                {/* 螢光筆的顏色選擇 */}
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
                {/* 螢光筆的大小選擇 */}
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

        {/* 橡皮擦按鈕 */}
        <button
          onClick={toggleEraseMode}
          className={`px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${
            drawingTool === "Eraser" ? "text-blue-500" : "text-black"
          }`}
        >
          <PiEraserFill /> {/* 橡皮擦圖標 */}
        </button>

        {/* 移動按鈕 */}
        <button
          onClick={toggleMoveMode}
          className={`px-4 py-2 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${
            drawingTool === "Move" ? "text-blue-500" : "text-black"
          }`}
        >
          <BsCursor /> {/* 移動圖標 */}
        </button>
      </div>

      {/* 繪圖區域 */}
      <Stage
        width={500} // 畫布寬度
        height={500} // 畫布高度
        onPointerDown={handlePointerDown} // 按下事件
        onPointerMove={handlePointerMove} // 移動事件
        onPointerUp={handlePointerUp} // 放開事件
        onContextMenu={handleContextMenu} // 右鍵事件
        className="border border-gray-400 rounded-lg shadow-lg" // 樣式
      >
        <Layer>
          {lines.map((line, index) => {
            const strokePoints = getStroke(line.points, line.tool === "Eraser" ? eraserOptions : updateOptions(line.size)) || [];
            return (
              <Line
                key={index}
                points={strokePoints.flatMap((p) => [p[0], p[1]])} // 將點轉為平坦陣列
                fill={line.color} // 填充顏色
                closed={true} // 閉合路徑
                stroke={line.color} // 邊框顏色
                strokeWidth={1} // 邊框寬度
                lineCap="round" // 線條端點樣式
                lineJoin="round" // 線條連接樣式
                x={line.x} // X座標偏移
                y={line.y} // Y座標偏移
              />
            );
          })}
          {currentPoints.length > 0 && (
            <Line
              points={getStroke(currentPoints, drawingTool === "Eraser" ? eraserOptions : updateOptions(size))
                .flatMap((p) => [p[0], p[1]]) || []} // 當前線條的點
              fill={drawingTool === "Eraser" || drawingTool === "Move" ? "transparent" : color} // 填充顏色
              closed={true} // 閉合路徑
              stroke={drawingTool === "Eraser" || drawingTool === "Move" ? "transparent" : color} // 邊框顏色
              strokeWidth={1} // 邊框寬度
              lineCap="round" // 線條端點樣式
              lineJoin="round" // 線條連接樣式
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}