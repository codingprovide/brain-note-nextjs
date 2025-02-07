"use client"; // Next.js 13+ 使用 app router 时需要

import React, { useRef, useEffect, useState } from "react";
// Fabric 默认导出方式
import * as fabric from "fabric";

// 引入 shadcn/ui 组件
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Draw({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  // 容器与 canvas 的引用
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // 绘图及画笔相关状态
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [brushType, setBrushType] = useState("Pencil");
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [shadowColor, setShadowColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(1);
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowOffset, setShadowOffset] = useState(0);

  // 记录各种 patternBrush 的 ref
  const patternBrushesRef = useRef<{
    vLinePatternBrush?: fabric.PatternBrush;
    hLinePatternBrush?: fabric.PatternBrush;
    squarePatternBrush?: fabric.PatternBrush;
    diamondPatternBrush?: fabric.PatternBrush;
    texturePatternBrush?: fabric.PatternBrush;
  }>({});

  // ============================
  // 新增：图片上传导入功能
  // ============================
  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const url = URL.createObjectURL(file);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (fileType === "image/svg+xml") {
      // 如果是 SVG 文件，仍然使用 loadSVGFromURL 加载
      fabric.loadSVGFromURL(url, (objects: any, options: any) => {
        const svg = fabric.util.groupSVGElements(
          objects,
          options
        ) as fabric.Object;
        svg.set({
          left: 0,
          top: 0,
          scaleX: 1,
          scaleY: 1,
        });
        canvas.add(svg);
        canvas.renderAll();
      });
    } else if (
      fileType === "image/png" ||
      fileType === "image/jpeg" ||
      fileType === "image/gif"
    ) {
      // 利用 fabric.util.loadImage 返回的 Promise<HTMLImageElement> 加载图片
      fabric.util
        .loadImage(url)
        .then((image: HTMLImageElement) => {
          // 用加载好的 image 元素创建 fabric.Image 对象
          const fabricImg = new fabric.Image(image, {
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1,
          });
          canvas.add(fabricImg);
          canvas.renderAll();
        })
        .catch((error) => {
          console.error("加载图片错误：", error);
        });
    } else {
      alert("不支持的文件类型！");
    }
  };

  // ============================
  // 1) 初始化 Fabric Canvas（仅在组件挂载时运行一次）
  // ============================
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: isDrawingMode,
    });
    fabricCanvasRef.current = canvas;

    // 全局设置：不透明的控制角
    fabric.Object.prototype.transparentCorners = false;

    // 创建各种 patternBrush（如果可用）
    if (fabric.PatternBrush) {
      // 垂直线 pattern
      const vLinePatternBrush = new fabric.PatternBrush(canvas);
      vLinePatternBrush.getPatternSrc = function () {
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.stroke();
        return patternCanvas;
      };

      // 水平线 pattern
      const hLinePatternBrush = new fabric.PatternBrush(canvas);
      hLinePatternBrush.getPatternSrc = function () {
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();
        return patternCanvas;
      };

      // 方形 pattern
      const squarePatternBrush = new fabric.PatternBrush(canvas);
      squarePatternBrush.getPatternSrc = function () {
        const squareWidth = 10;
        const squareDistance = 2;
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height =
          squareWidth + squareDistance;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, squareWidth, squareWidth);
        return patternCanvas;
      };

      // 菱形 pattern
      const diamondPatternBrush = new fabric.PatternBrush(canvas);
      diamondPatternBrush.getPatternSrc = function () {
        const squareWidth = 10;
        const squareDistance = 5;
        const patternCanvas = fabric.util.createCanvasElement();
        const rect = new fabric.Rect({
          width: squareWidth,
          height: squareWidth,
          angle: 45,
          fill: this.color,
        });
        const canvasWidth = rect.getBoundingRect().width;
        patternCanvas.width = patternCanvas.height =
          canvasWidth + squareDistance;
        rect.set({
          left: canvasWidth / 2,
          top: canvasWidth / 2,
        });
        const ctx = patternCanvas.getContext("2d")!;
        rect.render(ctx);
        return patternCanvas;
      };

      // 将各个 patternBrush 保存到 ref 中
      patternBrushesRef.current = {
        vLinePatternBrush,
        hLinePatternBrush,
        squarePatternBrush,
        diamondPatternBrush,
      };
    }

    // 默认使用 PencilBrush 作为绘制工具
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);

    // 组件卸载时清理 canvas
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // ============================
  // 2) 监听容器大小变化，动态设置 Canvas 的宽高
  // ============================
  // useEffect(() => {
  //   function updateCanvasSize() {
  //     const canvasEl = fabricCanvasRef.current;
  //     const containerEl = containerRef.current;
  //     if (!canvasEl || !containerEl) return;

  //     const { width, height } = containerEl.getBoundingClientRect();
  //     canvasEl.setWidth(width);
  //     canvasEl.setHeight(height);
  //     canvasEl.renderAll();
  //   }

  //   updateCanvasSize();
  //   window.addEventListener("resize", updateCanvasSize);
  //   return () => {
  //     window.removeEventListener("resize", updateCanvasSize);
  //   };
  // }, []);

  const isResizing = useRef(false);

  useEffect(() => {
    const canvasEl = fabricCanvasRef.current;
    if (!canvasEl || isResizing.current) return;

    isResizing.current = true;
    if (canvasEl.getWidth() !== width || canvasEl.getHeight() !== height) {
      canvasEl.setDimensions({ width, height });
    }
    isResizing.current = false;
  }, [width, height]);
  // ============================
  // 3) 根据 State 更新 isDrawingMode
  // ============================
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = isDrawingMode;
    }
  }, [isDrawingMode]);

  // ============================
  // 4) 监听画笔相关 State 的变化，更新画笔设置
  // ============================
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let newBrush: fabric.BaseBrush | null = null;
    switch (brushType) {
      case "hline":
        newBrush = patternBrushesRef.current.vLinePatternBrush || null;
        break;
      case "vline":
        newBrush = patternBrushesRef.current.hLinePatternBrush || null;
        break;
      case "square":
        newBrush = patternBrushesRef.current.squarePatternBrush || null;
        break;
      case "diamond":
        newBrush = patternBrushesRef.current.diamondPatternBrush || null;
        break;
      case "texture":
        newBrush = patternBrushesRef.current.texturePatternBrush || null;
        break;
      default: {
        // 如果选择的 brushType 对应 Fabric 内置 Brush，则直接创建
        const BrushClass = (fabric as any)[brushType + "Brush"];
        if (BrushClass) {
          newBrush = new BrushClass(canvas);
        } else {
          // 否则回退到 PencilBrush
          newBrush = new fabric.PencilBrush(canvas);
        }
      }
    }

    if (newBrush) {
      newBrush.color = drawingColor;
      newBrush.width = lineWidth;
      newBrush.shadow = new fabric.Shadow({
        blur: shadowBlur,
        offsetX: shadowOffset,
        offsetY: shadowOffset,
        affectStroke: true,
        color: shadowColor,
      });
      canvas.freeDrawingBrush = newBrush;
    }
    canvas.renderAll();
  }, [
    brushType,
    drawingColor,
    shadowColor,
    lineWidth,
    shadowBlur,
    shadowOffset,
  ]);

  // 清空画布
  const handleClearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.clear();
  };

  return (
    <div className="nodrag bg-white p-1 size-max w-[500px]">
      {/* 顶部工具栏 */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => setIsDrawingMode(!isDrawingMode)}
        >
          {isDrawingMode ? "end draw" : "starg draw"}
        </Button>

        <Select value={brushType} onValueChange={(val) => setBrushType(val)}>
          <SelectTrigger className="">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pencil">Pencil</SelectItem>
            <SelectItem value="hline">水平线</SelectItem>
            <SelectItem value="vline">垂直线</SelectItem>
            <SelectItem value="square">方形</SelectItem>
            <SelectItem value="diamond">菱形</SelectItem>
            <SelectItem value="texture">纹理</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="destructive" onClick={handleClearCanvas}>
          Clean
        </Button>

        {/* 新增：图片上传按钮 */}
        <div className="flex items-center space-x-2 ">
          <Label htmlFor="imageUpload">UploadImage:</Label>
          <Input
            id="imageUpload"
            type="file"
            accept="image/png, image/jpeg, image/svg+xml, image/gif"
            onChange={uploadImage}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="drawingColor">Color:</Label>
          <Input
            id="drawingColor"
            type="color"
            value={drawingColor}
            onChange={(e) => setDrawingColor(e.target.value)}
            className="w-12 p-0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="lineWidth">Stroke:</Label>
          <Input
            id="lineWidth"
            type="number"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      {/* 画布容器 */}
      <div
        ref={containerRef}
        className="mt-1 bg-white"
        style={{
          height: "800px",
          width: "230px",
          boxSizing: "border-box",
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
