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

export default function HandWritingCanvas() {
  const [buttonColor, setButtonColor] = useState("text-black");
  const [drawingTool, setDrawingTool] = useState("Pen");
  const [lines, setLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null);

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      if (drawingTool === "Pen") {
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
        const eraserOptions = {
          ...options,
          size: 20,
          thinning: 0,
          easing: (t) => t,
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
      <button
        onClick={toggleEraseMode}
        className={`px-4 py-2 mb-4 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${buttonColor}`}
      >
        {drawingTool === "Pen" ? "橡皮擦" : "畫筆"}
      </button>

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
            const strokePoints = getStroke(line.points, line.tool === "Eraser" ? { ...options, size: 20, thinning: 0, easing: (t) => t } : options) || [];
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
              points={getStroke(currentPoints, drawingTool === "Eraser" ? { ...options, size: 20, thinning: 0, easing: (t) => t } : options)
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