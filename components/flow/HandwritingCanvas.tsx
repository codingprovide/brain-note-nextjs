import React, { useState, useEffect  } from "react";
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

export default function HandWritingCanvas() {
  const [buttonColor, setButtonColor] = useState("text-black"); // 記錄按鈕文字顏色
  const [penColor, setPenColor] = useState("black")
  const [drawingTool, setDrawingTool] = useState("Pen")
  const [lines, setLines] = useState([]); // 存放所有畫過的線條
  const [penLines, setPenLines] = useState([]); 
  const [eraserLines, setEraserLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]); // 當前繪製的線條座標點
  const [selectedIndex, setSelectedIndex] = useState(null); // 被選中的線條索引
  const [startPos, setStartPos] = useState(null); // 滑鼠點擊時的起始位置

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      // 檢查是否點擊到已經畫出的線條
      const clickedIndex = lines.findIndex((line) => {
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
      // 正在繪製新的筆劃
      setCurrentPoints([...currentPoints, [e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
    }
  }




  useEffect(() => {
    console.log("penLines:", penLines);
  }, [penLines]);
  
  useEffect(() => {
    console.log("eraserLines:", eraserLines);
  }, [eraserLines]);
  
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
        setPenLines([...penLines, { points: currentPoints, x: 0, y: 0, color: penColor }]);
      } else {
        setEraserLines([...eraserLines, { points: currentPoints, x: 0, y: 0, color: penColor }]);
      }
      setLines([...lines, { points: currentPoints, x: 0, y: 0, color: penColor }]);
      setCurrentPoints([]);
    }
  }




  function handleContextMenu(e) {
    e.evt.preventDefault(); // 阻止右鍵菜單
  }

  function toggleEraseMode() {
    setButtonColor((prevColor) => (prevColor === "text-black" ? "text-blue-500" : "text-black"));
    setPenColor((prevColor) => (prevColor === "black" ? "blue" : "black"));
    setDrawingTool((prevTool) => (prevTool === "Pen" ? "Eraser" : "Pen"));
    console.log("Tool:",drawingTool)
  }

  return (
    <div className="flex flex-col items-center p-4">
      {/* 橡皮擦按鈕 */}
      <button
        onClick={toggleEraseMode}
        className={`px-4 py-2 mb-4 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${buttonColor}`}
      >
        橡皮擦
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

          {/* 畫當前筆劃 */}
          {currentPoints.length > 0 && (
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
