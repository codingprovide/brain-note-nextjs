import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { getStroke } from "perfect-freehand";

const createOptions = (size, opacity = 1) => ({
  size,
  thinning: 0.2,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => Math.sin(t * Math.PI * 0.5),
  opacity
});

const eraserOptions = {
  size: 20,
  thinning: 0,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => t,
};

export default function HandWritingCanvas() {
  const [activeTool, setActiveTool] = useState("Pen");
  const [penColor, setPenColor] = useState("black");
  const [penSize, setPenSize] = useState("medium");
  const [highlightColor, setHighlightColor] = useState("yellow");
  const [highlightSize, setHighlightSize] = useState("medium");
  
  const [lines, setLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectedLines, setSelectedLines] = useState([]);
  
  const stageRef = useRef(null);

  const getCurrentColor = () => {
    if (activeTool === "Pen") return penColor;
    if (activeTool === "Highlight") {
      const opacity = 0.4;
      if (highlightColor === "yellow") return `rgba(255, 255, 0, ${opacity})`;
      if (highlightColor === "green") return `rgba(0, 255, 0, ${opacity})`;
      if (highlightColor === "orange") return `rgba(255, 165, 0, ${opacity})`;
    }
    return "rgba(240, 240, 240, 0.5)";
  };

  const getCurrentSize = () => {
    const tool = activeTool === "Pen" ? penSize : highlightSize;
    if (tool === "thin") return 2;
    if (tool === "medium") return 5;
    if (tool === "thick") return 8;
    return 5;
  };

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
      setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      setSelectedLines([]);
      setStartPos(pos);
    } 
    else if (selectedLines.length > 0 && isInSelectionArea(pos)) {
      setStartPos(pos);
    }
    else {
      setCurrentPoints([[pos.x, pos.y, e.evt.pressure || 0.5]]);
    }
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return;
    
    const pos = { x: e.evt.offsetX, y: e.evt.offsetY };
    
    if (selectionRect && activeTool === "Select") {
      setSelectionRect({
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y)
      });
    } 
    else if (currentPoints.length > 0) {
      setCurrentPoints([...currentPoints, [pos.x, pos.y, e.evt.pressure || 0.5]]);
    }
  }

  function handlePointerUp(e) {
    if (currentPoints.length > 0) {
      setLines(prevLines => [...prevLines, {
        points: currentPoints,
        x: 0,
        y: 0,
        tool: activeTool,
        color: getCurrentColor(),
        size: getCurrentSize()
      }]);
      setCurrentPoints([]);
    }
  }

  return (
    <Stage
      width={500}
      height={500}
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="border border-gray-400 rounded-lg shadow-lg"
    >
      <Layer>
        {lines.map((line, index) => (
          <Line
            key={index}
            points={line.points.flat()}
            stroke={line.color}
            strokeWidth={line.size}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </Layer>
    </Stage>
  );
}
