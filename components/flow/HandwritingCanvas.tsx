import React, { useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getStroke } from "perfect-freehand";
import { usePaintToolBarStore, PaintToolBarState } from "@/store/paint-tool-bar-store";
import { useDropDownStore, DropDownState } from "@/store/drop-down-store";

const options = {
  size: 3,
  thinning: 0.2,
  smoothing: 0.99,
  streamline: 0.99,
  easing: (t) => Math.sin(t * Math.PI * 0.5),
};

export default function HandWritingCanvas() {
  const [lines, setLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null);

  const { paintTool } = usePaintToolBarStore<PaintToolBarState>((state) => state);
  const { toolColor, stroke } = useDropDownStore<DropDownState>((state) => state);

  useEffect(() => {
    console.log("paintTool has changed:", paintTool);
  }, [paintTool]);
  useEffect(() => {
    console.log("lines", lines);
  }, [lines]);

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      if (paintTool === "Move") {
        // 只有在 Move 模式下才檢查線條是否被點擊
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
          setCurrentPoints([]);
        }
      } else {
        // 在非 Move 模式下，處理繪製或擦除
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
      }
    }
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return;

    if (selectedIndex !== null && startPos && paintTool === "Move") {
      // 只有在 Move 模式下才能移動線條
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
    } else if (currentPoints.length > 0 && paintTool !== "Move") {
      if (paintTool === "Eraser") {
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
      } else {
        setLines((prevLines) => [
          ...prevLines,
          { points: currentPoints, x: 0, y: 0, tool: paintTool, color: toolColor, strokeWidth: stroke },
        ]);        
      }
      setCurrentPoints([]);
    }
  }

  function handleContextMenu(e) {
    e.evt.preventDefault();
  }

  return (
    <div className="flex flex-col items-center p-4">
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
                strokeWidth={line.strokeWidth}
                lineCap="round"
                lineJoin="round"
                x={line.x}
                y={line.y}
              />
            );
          })}

          {currentPoints.length > 0 && (
            <Line
              points={getStroke(currentPoints, paintTool === "Eraser" ? { ...options, size: 20, thinning: 0, easing: (t) => t } : options)
                .flatMap((p) => [p[0], p[1]]) || []}
              fill={paintTool === "Eraser" || paintTool === "Move" ? "transparent" : toolColor}
              closed={true}
              stroke={paintTool === "Eraser" || paintTool === "Move" ? "transparent" : toolColor}
              strokeWidth={stroke}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}