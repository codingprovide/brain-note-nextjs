import React, { useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getStroke } from "perfect-freehand";

const options = {
  size: 15,
  thinning: 0.5,
  smoothing: 0.6,
  streamline: 0.5,
  easing: (t) => t,
  start: { taper: 0, easing: (t) => t, cap: true },
  end: { taper: 100, easing: (t) => t, cap: true },
};

export default function HandWritingCanvas() {
  const [lines, setLines] = useState([]); // 存所有筆畫
  const [currentPoints, setCurrentPoints] = useState([]); // 當前筆畫
  const [selectedIndex, setSelectedIndex] = useState(null); // 選中的線條索引
  const [startPos, setStartPos] = useState(null); // 記錄初始滑鼠位置

  function handlePointerDown(e) {
    e.evt.preventDefault();

    if (e.evt.buttons === 1) {
      // 檢查是否點擊到現有的線條
      const clickedIndex = lines.findIndex((line) => {
        const { x, y, points } = line;
        return points.some(([px, py]) => {
          const dx = e.evt.offsetX - (px + x);
          const dy = e.evt.offsetY - (py + y);
          return Math.sqrt(dx * dx + dy * dy) < 20; // 允許誤差範圍
        });
      });

      if (clickedIndex !== -1) {
         console.log("ok")
        setSelectedIndex(clickedIndex);
        setStartPos({ x: e.evt.offsetX, y: e.evt.offsetY });
      } else {
        // 沒有選中任何東西，開始新畫筆
        setCurrentPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
      }
    }
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 1) return;

    if (selectedIndex !== null) {
      // **右鍵拖動選中的線條**
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
      // **右鍵畫圖**
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

  return (
    <Stage
      width={500}
      height={500}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      style={{ touchAction: "none", border: "1px solid black" }}
    >
      <Layer>
        {/* 畫所有筆畫 */}
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

        {/* 畫當前筆畫 */}
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
  );
}
