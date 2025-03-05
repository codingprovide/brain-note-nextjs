import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { getStroke } from "perfect-freehand";

// 手寫筆劃的基本參數設置
const createOptions = (size, opacity = 1) => ({
  size,
  thinning: 0.2,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => Math.sin(t * Math.PI * 0.5),
  opacity
});

// 橡皮擦的參數設置
const eraserOptions = {
  size: 20,
  thinning: 0,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => t,
};

export default function HandWritingCanvas() {
  // 所有工具的狀態
  const [activeTool, setActiveTool] = useState("Pen"); // "Pen", "Highlight", "Eraser", "Select"
  const [penColor, setPenColor] = useState("black");
  const [penSize, setPenSize] = useState("medium"); // "thin", "medium", "thick"
  const [highlightColor, setHighlightColor] = useState("yellow");
  const [highlightSize, setHighlightSize] = useState("medium");
  
  // 存儲所有線條和當前繪製狀態
  const [lines, setLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  
  // 選擇和移動相關狀態
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectedLines, setSelectedLines] = useState([]);
  
  // 獲取 Stage 引用以便進行座標轉換
  const stageRef = useRef(null);

  // 獲取當前工具的顏色
  const getCurrentColor = () => {
    if (activeTool === "Pen") return penColor;
    if (activeTool === "Highlight") {
      const opacity = 0.4; // 螢光筆的透明度
      if (highlightColor === "yellow") return `rgba(255, 255, 0, ${opacity})`;
      if (highlightColor === "green") return `rgba(0, 255, 0, ${opacity})`;
      if (highlightColor === "orange") return `rgba(255, 165, 0, ${opacity})`;
    }
    return "rgba(240, 240, 240, 0.5)"; // 橡皮擦顏色
  };

  // 獲取當前工具的粗細
  const getCurrentSize = () => {
    const tool = activeTool === "Pen" ? penSize : highlightSize;
    if (tool === "thin") return 2;
    if (tool === "medium") return 5;
    if (tool === "thick") return 8;
    return 5; // 默認中等粗細
  };

  // 獲取當前工具的設置選項
  const getCurrentOptions = () => {
    if (activeTool === "Eraser") return eraserOptions;
    
    const size = getCurrentSize();
    const opacity = activeTool === "Highlight" ? 0.4 : 1;
    return createOptions(size, opacity);
  };

  function handlePointerDown(e) {
    e.evt.preventDefault();
    
    if (e.evt.buttons !== 1) return;
    
    const pos = { x: e.evt.offsetX, y: e.evt.offsetY };
    
    if (activeTool === "Select") {
      // 開始選區
      setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      setSelectedLines([]);
      setStartPos(pos);
    } 
    else if (selectedLines.length > 0 && isInSelectionArea(pos)) {
      // 開始移動已選區域
      setStartPos(pos);
    }
    else if (activeTool !== "Eraser") {
      // 檢查是否點擊到已經畫出的線條（非選區模式，僅在非橡皮擦模式下）
      const clickedIndex = lines.findIndex((line) => {
        const { x, y, points } = line;
        return points.some(([px, py]) => {
          const dx = pos.x - (px + x);
          const dy = pos.y - (py + y);
          return Math.sqrt(dx * dx + dy * dy) < 5;
        });
      });

      if (clickedIndex !== -1) {
        setSelectedIndex(clickedIndex);
        setStartPos(pos);
      } else {
        // 開始新的筆劃
        setCurrentPoints([[pos.x, pos.y, e.evt.pressure || 0.5]]);
      }
    } else {
      // 橡皮擦模式：直接開始記錄橡皮擦的軌跡
      setCurrentPoints([[pos.x, pos.y, e.evt.pressure || 0.5]]);
    }
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return;
    
    const pos = { x: e.evt.offsetX, y: e.evt.offsetY };
    
    if (selectionRect && activeTool === "Select") {
      // 正在繪製選區
      setSelectionRect({
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y)
      });
    } 
    else if (selectedLines.length > 0 && startPos) {
      // 移動已選線條
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      
      setStartPos(pos);
      
      setLines(prevLines => {
        return prevLines.map((line, index) => {
          if (selectedLines.includes(index)) {
            return { ...line, x: line.x + dx, y: line.y + dy };
          }
          return line;
        });
      });
    } 
    else if (selectedIndex !== null) {
      // 移動單條線
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      setStartPos(pos);

      setLines(prevLines => {
        const newLines = [...prevLines];
        newLines[selectedIndex] = {
          ...newLines[selectedIndex],
          x: newLines[selectedIndex].x + dx,
          y: newLines[selectedIndex].y + dy,
        };
        return newLines;
      });
    } 
    else if (currentPoints.length > 0) {
      // 正在繪製新筆劃
      setCurrentPoints([...currentPoints, [pos.x, pos.y, e.evt.pressure || 0.5]]);
    }
  }

  function handlePointerUp(e) {
    const pos = { x: e.evt.offsetX, y: e.evt.offsetY };
    
    if (selectionRect && activeTool === "Select") {
      // 完成選區，選中所有在選區內的線條
      const selected = [];
      
      lines.forEach((line, index) => {
        const linePoints = getStroke(line.points, 
          line.tool === "Eraser" ? eraserOptions : 
          line.tool === "Highlight" ? createOptions(line.size, 0.4) : 
          createOptions(line.size));
        
        // 檢查線條是否有任何部分在選區內
        for (const point of linePoints) {
          const px = point[0] + line.x;
          const py = point[1] + line.y;
          
          if (
            px >= selectionRect.x && 
            px <= selectionRect.x + selectionRect.width &&
            py >= selectionRect.y && 
            py <= selectionRect.y + selectionRect.height
          ) {
            selected.push(index);
            break;
          }
        }
      });
      
      setSelectedLines(selected);
      // 保持選區可見
      if (selected.length === 0) {
        setSelectionRect(null);
      }
    } 
    else if (selectedIndex !== null) {
      setSelectedIndex(null);
    } 
    else if (currentPoints.length > 0) {
      if (activeTool === "Eraser") {
        // 橡皮擦模式：擦除與橡皮擦軌跡相交的線條
        const eraserPoints = getStroke(currentPoints, eraserOptions);
        
        setLines(prevLines => {
          return prevLines.filter(line => {
            if (line.tool === "Eraser") return true; // 保留橡皮擦痕跡
            
            const linePoints = getStroke(line.points, 
              line.tool === "Highlight" ? createOptions(line.size, 0.4) : createOptions(line.size));
            
            for (const linePoint of linePoints) {
              for (const eraserPoint of eraserPoints) {
                const dx = (linePoint[0] + line.x) - eraserPoint[0];
                const dy = (linePoint[1] + line.y) - eraserPoint[1];
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < eraserOptions.size) {
                  return false;
                }
              }
            }
            return true;
          });
        });
      } 
      else if (activeTool === "Pen" || activeTool === "Highlight") {
        // 新增新的筆劃
        setLines(prevLines => [
          ...prevLines,
          { 
            points: currentPoints, 
            x: 0, 
            y: 0, 
            tool: activeTool, 
            color: getCurrentColor(),
            size: getCurrentSize()
          },
        ]);
      }
      
      setCurrentPoints([]);
    }
  }

  // 判斷點是否在選區內
  function isInSelectionArea(pos) {
    if (!selectionRect) return false;
    
    return (
      pos.x >= selectionRect.x && 
      pos.x <= selectionRect.x + selectionRect.width &&
      pos.y >= selectionRect.y && 
      pos.y <= selectionRect.y + selectionRect.height
    );
  }

  function handleContextMenu(e) {
    e.evt.preventDefault(); // 阻止右鍵菜單
  }

  function handleToolChange(tool) {
    setActiveTool(tool);
    if (tool !== "Select") {
      setSelectionRect(null);
      setSelectedLines([]);
    }
  }

  // 清除選區
  function clearSelection() {
    setSelectionRect(null);
    setSelectedLines([]);
  }

  // 顏色選擇器組件
  const ColorPicker = ({ colors, activeColor, onChange, label }) => (
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-sm font-medium w-16">{label}:</span>
      <div className="flex space-x-1">
        {colors.map(color => (
          <button
            key={color.value}
            className={`w-6 h-6 rounded-full border ${activeColor === color.value ? 'border-2 border-black' : 'border-gray-300'}`}
            style={{ backgroundColor: color.display }}
            onClick={() => onChange(color.value)}
          />
        ))}
      </div>
    </div>
  );

  // 粗細選擇器組件
  const SizePicker = ({ activeSize, onChange, label }) => (
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-sm font-medium w-16">{label}:</span>
      <div className="flex space-x-2">
        <button
          className={`w-6 h-6 flex items-center justify-center border rounded ${activeSize === 'thin' ? 'bg-gray-200' : ''}`}
          onClick={() => onChange('thin')}
        >
          <div className="w-4 h-1 bg-black rounded-full" />
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center border rounded ${activeSize === 'medium' ? 'bg-gray-200' : ''}`}
          onClick={() => onChange('medium')}
        >
          <div className="w-4 h-2 bg-black rounded-full" />
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center border rounded ${activeSize === 'thick' ? 'bg-gray-200' : ''}`}
          onClick={() => onChange('thick')}
        >
          <div className="w-4 h-3 bg-black rounded-full" />
        </button>
      </div>
    </div>
  );

  // 常用顏色配置
  const penColors = [
    { value: 'black', display: '#000000' },
    { value: 'red', display: '#FF0000' },
    { value: 'blue', display: '#0000FF' }
  ];
  
  const highlightColors = [
    { value: 'yellow', display: 'rgba(255, 255, 0, 0.4)' },
    { value: 'green', display: 'rgba(0, 255, 0, 0.4)' },
    { value: 'orange', display: 'rgba(255, 165, 0, 0.4)' }
  ];

  return (
    <div className="flex flex-col items-center p-4">
      {/* 工具欄 */}
      <div className="w-full max-w-md flex justify-between mb-4">
        <button
          onClick={() => handleToolChange("Pen")}
          className={`px-3 py-2 border rounded-lg shadow ${activeTool === "Pen" ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
        >
          畫筆
        </button>
        <button
          onClick={() => handleToolChange("Highlight")}
          className={`px-3 py-2 border rounded-lg shadow ${activeTool === "Highlight" ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
        >
          螢光筆
        </button>
        <button
          onClick={() => handleToolChange("Eraser")}
          className={`px-3 py-2 border rounded-lg shadow ${activeTool === "Eraser" ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
        >
          橡皮擦
        </button>
        <button
          onClick={() => handleToolChange("Select")}
          className={`px-3 py-2 border rounded-lg shadow ${activeTool === "Select" ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
        >
          選取拖移
        </button>
      </div>
      
      {/* 工具設置面板 */}
      <div className="w-full max-w-md mb-4 p-3 border rounded-lg">
        {activeTool === "Pen" && (
          <div>
            <ColorPicker 
              colors={penColors} 
              activeColor={penColor} 
              onChange={setPenColor} 
              label="顏色" 
            />
            <SizePicker 
              activeSize={penSize} 
              onChange={setPenSize} 
              label="粗細" 
            />
          </div>
        )}
        
        {activeTool === "Highlight" && (
          <div>
            <ColorPicker 
              colors={highlightColors} 
              activeColor={highlightColor} 
              onChange={setHighlightColor} 
              label="顏色" 
            />
            <SizePicker 
              activeSize={highlightSize} 
              onChange={setHighlightSize} 
              label="粗細" 
            />
          </div>
        )}
        
        {activeTool === "Select" && (
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {selectedLines.length === 0 
                ? "請拖曳選取範圍" 
                : `已選取 ${selectedLines.length} 條線`}
            </span>
            {selectedLines.length > 0 && (
              <button 
                onClick={clearSelection}
                className="px-2 py-1 text-sm border rounded-lg hover:bg-gray-100"
              >
                取消選取
              </button>
            )}
          </div>
        )}
        
        {activeTool === "Eraser" && (
          <span className="text-sm">
            使用橡皮擦移動滑鼠來擦除筆劃
          </span>
        )}
      </div>
      
      {/* 繪圖區域 */}
      <Stage
        width={500}
        height={500}
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="border border-gray-400 rounded-lg shadow-lg"
      >
        <Layer>
          {/* 繪製所有線條 */}
          {lines.map((line, index) => {
            const isSelected = selectedLines.includes(index);
            const options = line.tool === "Eraser" 
              ? eraserOptions 
              : line.tool === "Highlight"
                ? createOptions(line.size, 0.4)
                : createOptions(line.size);
            
            return (
              <Line
                key={index}
                points={getStroke(line.points, options).flatMap((p) => [p[0], p[1]])}
                fill={line.color}
                closed={true}
                stroke={isSelected ? "#4299e1" : line.color}
                strokeWidth={isSelected ? 2 : 1}
                dash={isSelected ? [5, 5] : undefined}
                lineCap="round"
                lineJoin="round"
                x={line.x}
                y={line.y}
              />
            );
          })}
          
          {/* 當前筆劃 */}
          {currentPoints.length > 0 && (
            <Line
              points={getStroke(currentPoints, getCurrentOptions()).flatMap((p) => [p[0], p[1]])}
              fill={getCurrentColor()}
              closed={true}
              stroke={getCurrentColor()}
              strokeWidth={1}
              lineCap="round"
              lineJoin="round"
            />
          )}
          
          {/* 選取範圍框 */}
          {selectionRect && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              stroke="#4299e1"
              strokeWidth={1}
              dash={[5, 5]}
              fill="rgba(66, 153, 225, 0.1)"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}