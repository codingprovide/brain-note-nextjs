import React, { useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getStroke } from "perfect-freehand";

// 提取配置到组件外部，便于调整和复用
const STROKE_OPTIONS = {
  size: 5,
  thinning: 0.2,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => Math.sin(t * Math.PI * 0.5),
};

const TOOLS = {
  PEN: "Pen",
  ERASER: "Eraser",
};

const COLORS = {
  BLACK: "black",
  RED: "#FF0000",
  BLUE: "#0000FF",
  GREEN: "#008000",
  YELLOW: "#FFD700",
  PURPLE: "#800080",
  ERASER: "#e5e7eb", // 背景色用于橡皮擦
};

export default function test2() {
  const [lines, setLines] = useState([]);
  const [penLines, setPenLines] = useState([]);
  const [eraserLines, setEraserLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  
  // 工具和颜色状态
  const [drawingTool, setDrawingTool] = useState(TOOLS.PEN);
  const [penColor, setPenColor] = useState(COLORS.BLACK);
  const [penSize, setPenSize] = useState(5);
  
  // 拖动相关状态
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null);
  
  // 历史记录
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 更新options以适应不同的笔尖大小
  const currentOptions = {
    ...STROKE_OPTIONS,
    size: penSize,
  };

  // 历史记录保存
  const saveToHistory = useCallback((newLines) => {
    // 删除当前状态之后的历史
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newLines]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 撤销功能
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setLines([...history[newIndex]]);
      
      // 更新penLines和eraserLines
      const newPenLines = history[newIndex].filter(line => line.color !== COLORS.ERASER);
      const newEraserLines = history[newIndex].filter(line => line.color === COLORS.ERASER);
      setPenLines(newPenLines);
      setEraserLines(newEraserLines);
      
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // 恢复功能
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setLines([...history[newIndex]]);
      
      // 更新penLines和eraserLines
      const newPenLines = history[newIndex].filter(line => line.color !== COLORS.ERASER);
      const newEraserLines = history[newIndex].filter(line => line.color === COLORS.ERASER);
      setPenLines(newPenLines);
      setEraserLines(newEraserLines);
      
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // 清空画布
  const clearCanvas = useCallback(() => {
    setLines([]);
    setPenLines([]);
    setEraserLines([]);
    saveToHistory([]);
  }, [saveToHistory]);

  // 保存为图片
  const saveAsImage = useCallback(() => {
    const stage = document.querySelector('canvas');
    if (stage) {
      const dataUrl = stage.toDataURL();
      const link = document.createElement('a');
      link.download = 'handwriting.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z: 撤销
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y: 重做
      else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // 'e' 键: 切换橡皮擦
      else if (e.key === 'e') {
        toggleEraseMode();
      }
      // 'd' 键: 切换拖动模式
      else if (e.key === 'd') {
        toggleDragMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  // 初始化历史记录
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory([]);
    }
  }, [history.length, saveToHistory]);

  const handlePointerDown = (e) => {
    e.evt.preventDefault();

    if (isDraggingMode) {
      // 拖移模式：选取线条
      const clickedIndex = lines.findIndex((line) =>
        line.points.some(([px, py]) => {
          const dx = e.evt.offsetX - (px + (line.x || 0));
          const dy = e.evt.offsetY - (py + (line.y || 0));
          return Math.sqrt(dx * dx + dy * dy) < 10; // 允许误差范围
        })
      );

      if (clickedIndex !== -1) {
        setSelectedIndex(clickedIndex);
        setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });
      }
    } else if (e.evt.buttons === 1) {
      // 绘图模式
      setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure || 0.5]]);
    }
  };

  const handlePointerMove = (e) => {
    if (isDraggingMode && selectedIndex !== null) {
      // 拖移模式：移动选中的线条
      const dx = e.evt.offsetX - startPos.x;
      const dy = e.evt.offsetY - startPos.y;
      setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });

      setLines((prevLines) =>
        prevLines.map((line, index) =>
          index === selectedIndex ? { ...line, x: (line.x || 0) + dx, y: (line.y || 0) + dy } : line
        )
      );
    } else if (!isDraggingMode && e.evt.buttons === 1) {
      // 绘图模式
      setCurrentPoints([...currentPoints, [e.evt.offsetX, e.evt.offsetY, e.evt.pressure || 0.5]]);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingMode) {
      if (selectedIndex !== null) {
        // 保存移动后的状态到历史记录
        saveToHistory(lines);
        setSelectedIndex(null);
      }
    } else if (currentPoints.length > 0) {
      let updatedLines = [...lines];
      
      if (drawingTool === TOOLS.PEN) {
        const newPenLine = { points: currentPoints, x: 0, y: 0, color: penColor };
        const newPenLines = [...penLines, newPenLine];
        setPenLines(newPenLines);
        updatedLines = [...lines, newPenLine];
      } else {
        const newEraserLine = { points: currentPoints, x: 0, y: 0, color: COLORS.ERASER };
        const newEraserLines = [...eraserLines, newEraserLine];
        setEraserLines(newEraserLines);

        // 进行局部擦除
        const updatedPenLines = penLines.flatMap((penLine) => erasePenLine(penLine, currentPoints));
        setPenLines(updatedPenLines);
        updatedLines = [...updatedPenLines, newEraserLine];
      }
      
      setLines(updatedLines);
      saveToHistory(updatedLines);
      setCurrentPoints([]);
    }
  };

  const erasePenLine = (penLine, eraserPoints) => {
    let remainingSegments = [];
    let currentSegment = [];
  
    for (let i = 0; i < penLine.points.length; i++) {
      const [px, py] = penLine.points[i];
  
      // 检查这个点是否被擦除
      const isErased = eraserPoints.some(([ex, ey]) => {
        const dx = px - ex;
        const dy = py - ey;
        return Math.sqrt(dx * dx + dy * dy) < penSize + 2; // 擦除范围随笔尖大小调整
      });
  
      if (!isErased) {
        currentSegment.push(penLine.points[i]);
      } else if (currentSegment.length > 0) {
        // 被擦除时，把当前累积的线段存起来
        remainingSegments.push(currentSegment);
        currentSegment = [];
      }
    }
  
    if (currentSegment.length > 0) {
      remainingSegments.push(currentSegment);
    }
  
    return remainingSegments.map((seg) => ({
      points: seg,
      x: penLine.x || 0,
      y: penLine.y || 0,
      color: penLine.color,
    }));
  };

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
  };

  const toggleEraseMode = () => {
    setDrawingTool(prevTool => prevTool === TOOLS.PEN ? TOOLS.ERASER : TOOLS.PEN);
  };

  const toggleDragMode = () => {
    setIsDraggingMode(prevMode => !prevMode);
  };

  const handleColorChange = (color) => {
    setPenColor(color);
    setDrawingTool(TOOLS.PEN); // 切换颜色时自动切回绘画模式
  };

  const handleSizeChange = (e) => {
    setPenSize(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-xl">
        <div className="flex flex-wrap gap-2 mb-4">
          {/* 工具栏 */}
          <div className="flex gap-2">
            <button
              onClick={toggleEraseMode}
              className={`px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 ${
                drawingTool === TOOLS.ERASER ? "bg-blue-500 text-white" : "bg-white"
              }`}
              title="橡皮擦 (E)"
            >
              橡皮擦
            </button>
            <button
              onClick={toggleDragMode}
              className={`px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 ${
                isDraggingMode ? "bg-blue-500 text-white" : "bg-white"
              }`}
              title="拖移模式 (D)"
            >
              拖移
            </button>
          </div>
          
          {/* 历史操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 ${
                historyIndex <= 0 ? "bg-gray-200 text-gray-500" : "bg-white hover:bg-gray-100"
              }`}
              title="撤销 (Ctrl+Z)"
            >
              撤销
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 ${
                historyIndex >= history.length - 1 ? "bg-gray-200 text-gray-500" : "bg-white hover:bg-gray-100"
              }`}
              title="重做 (Ctrl+Y)"
            >
              恢复
            </button>
            <button
              onClick={clearCanvas}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 bg-white hover:bg-gray-100"
              title="清空画布"
            >
              清空
            </button>
            <button
              onClick={saveAsImage}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 bg-white hover:bg-gray-100"
              title="保存为PNG图片"
            >
              保存
            </button>
          </div>
        </div>
        
        {/* 颜色选择器 */}
        <div className="flex justify-center gap-2 mb-4">
          {Object.entries(COLORS).filter(([key]) => key !== "ERASER").map(([name, color]) => (
            <button
              key={name}
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-full border ${
                penColor === color ? "border-2 border-black" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={name.toLowerCase()}
            />
          ))}
        </div>
        
        {/* 笔尖大小调整 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm">笔尖大小:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={penSize}
            onChange={handleSizeChange}
            className="w-32"
          />
          <span className="text-sm">{penSize}px</span>
        </div>
      </div>

      {/* 绘图区域 */}
      <Stage
        width={600}
        height={400}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="border border-gray-400 rounded-lg shadow-lg bg-white"
      >
        <Layer>
          {lines.map((line, index) => (
            <Line
              key={index}
              points={getStroke(line.points, currentOptions).flatMap((p) => [p[0], p[1]])}
              fill={line.color}
              closed={true}
              stroke={line.color}
              strokeWidth={1}
              lineCap="round"
              lineJoin="round"
              x={line.x || 0}
              y={line.y || 0}
              opacity={selectedIndex === index ? 0.7 : 1}
            />
          ))}
          {currentPoints.length > 0 && !isDraggingMode && (
            <Line
              points={getStroke(currentPoints, currentOptions).flatMap((p) => [p[0], p[1]])}
              fill={drawingTool === TOOLS.PEN ? penColor : COLORS.ERASER}
              closed={true}
              stroke={drawingTool === TOOLS.PEN ? penColor : COLORS.ERASER}
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