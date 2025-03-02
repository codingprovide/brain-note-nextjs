import React, { useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getStroke } from "perfect-freehand";

const options = {
  size: 15,
  thinning: 0.5,
  smoothing: 0.6,
  streamline: 0.5,
  easing: (t) => t,
  start: {
    taper: 0,
    easing: (t) => t,
    cap: true,
  },
  end: {
    taper: 100,
    easing: (t) => t,
    cap: true,
  },
};

export default function HandWritingCanvas() {
  const [lines, setLines] = useState([]);
  const [points, setPoints] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);

  function handlePointerDown(e) {
    if (e.evt.buttons !== 2) return;
    setPoints([[e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
  }

  function handlePointerMove(e) {
    if (e.evt.buttons !== 2) return;
    setCurrentPoints([...currentPoints, [e.evt.offsetX, e.evt.offsetY, e.evt.pressure]]);
  }

  function handlePointerUp() {
    if (currentPoints.length === 0) return;
    setLines([...lines, currentPoints]); // 把這筆畫存入 `lines`
    setCurrentPoints([]); // 清空 `currentPoints`
  }

  function handleContextMenu(e) {
    e.evt.preventDefault(); // 禁用預設右鍵選單
  }

  // 取得筆劃邊界
  const stroke = getStroke(points, options);
  const flattenedPoints = stroke.flatMap((p) => [p[0], p[1]]);

  return (
    <Stage
      width={500}
      height={500}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu} // 禁止右鍵開啟瀏覽器選單
      style={{ touchAction: "none", border: "1px solid black" }}
    >
      <Layer>
        {/* 畫所有已存的筆畫 */}
        {lines.map((strokePoints, index) => {
          const stroke = getStroke(strokePoints, options);
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
            />
          );
        })}

        {/* 畫當前正在畫的筆畫 */}
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