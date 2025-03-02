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
  const [lines, setLines] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [startPos, setStartPos] = useState(null);

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      const clickedIndex = lines.findIndex((line) => {
        const { x, y, points } = line;
        return points.some(([px, py]) => {
          const dx = e.evt.offsetX - (px + x);
          const dy = e.evt.offsetY - (py + y);
          return Math.sqrt(dx * dx + dy * dy) < 20;
        });
      });

      if (clickedIndex !== -1) {
        setSelectedIndex(clickedIndex);
        setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });
      } else {
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
      }
    }
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return;

    if (selectedIndex !== null) {
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
      setCurrentPoints([...currentPoints, [e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
    }
  }

  function handlePointerUp() {
    if (selectedIndex !== null) {
      setSelectedIndex(null);
    } else if (currentPoints.length > 0) {
      setLines([...lines, { points: currentPoints, x: 0, y: 0 }]);
      setCurrentPoints([]);
    }
  }

  function handleContextMenu(e) {
    e.evt.preventDefault();
  }

  function toggleEraseMode() {
    setButtonColor((prevColor) => (prevColor === "text-black" ? "text-blue-500" : "text-black"));
  }

  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={toggleEraseMode}
        className={`px-4 py-2 mb-4 border border-gray-300 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 ${buttonColor}`}
      >
        橡皮擦
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
            const stroke = getStroke(line.points, options);
            const flattenedPoints = stroke.flatMap((p) => [p[0], p[1]]);
            return (
              <Line
                key={index}
                points={flattenedPoints}
                fill="black"
                closed={true}
                stroke="black"
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
              points={getStroke(currentPoints, options).flatMap((p) => [p[0], p[1]])}
              fill="black"
              closed={true}
              stroke="black"
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