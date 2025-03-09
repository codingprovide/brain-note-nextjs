import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MousePointer2, MoveUpRight, Pen } from "lucide-react";

import { RxText } from "react-icons/rx";
import { useToolBarStore, ToolBarState } from "@/store/tool-bar-store";
import {
  usePaintToolBarStore,
  PaintToolBarState,
} from "@/store/paint-tool-bar-store";
import { useDropDownStore, DropDownState } from "@/store/drop-down-store";
import { FaPencilAlt, FaHighlighter } from "react-icons/fa";
import { PiEraserFill } from "react-icons/pi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const ToolbarButton = ({
  icon,
  label,
  onClick,
  active = false,
}: ToolbarButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "secondary" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-md"
          onClick={onClick}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const PaintButton = ({ icon, onClick, active = false }: ToolbarButtonProps) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    size="icon"
    className="h-10 w-10 rounded-md"
    onClick={onClick}
  >
    {icon}
  </Button>
);

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const [showColor, setShowColor] = useState<string[]>([]);
  const { activeTool, setActiveTool } = useToolBarStore<ToolBarState>(
    (state) => state
  );
  const { paintTool, setPaintTool } = usePaintToolBarStore<PaintToolBarState>(
    (state) => state
  );
  const { toolColor, setToolColor, stroke, setStroke } =
    useDropDownStore<DropDownState>((state) => state);
  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
  };
  const handlePaintToolClick = (tool: string) => {
    setPaintTool(tool);
    setShowColor(tool === "Pen" ? penColor : highLightColor);
  };
  const handleToolColorClick = (color: string) => {
    setToolColor(color);
  };
  const handleStokeClick = (width: number) => {
    setStroke(width);
  };
  const penColor = [
    "rgb(0, 0, 0)",
    "rgb(239, 68, 68)",
    "rgb(59, 130, 246)",
    "rgb(168, 85, 247)",
  ];
  const highLightColor = [
    "rgba(250, 204, 21, 0.5)",
    "rgba(34, 197, 94, 0.5)",
    "rgba(251, 146, 60, 0.5)",
    "rgba(107, 114, 128, 0.5)",
  ];

  <Pen />;
  return (
    <div>
      <div
        className={`bg-white rounded-lg border shadow-sm p-1.5 inline-flex items-center gap-1 ${className}`}
      >
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<MousePointer2 className="h-5 w-5" />}
            label="Select"
            active={activeTool === "Select"}
            onClick={() => handleToolClick("Select")}
          />
          <ToolbarButton
            icon={<MoveUpRight className="h-5 w-5" />}
            label="Connection"
            active={activeTool === "Connection"}
            onClick={() => handleToolClick("Connection")}
          />
          <ToolbarButton
            icon={<RxText className="h-5 w-5" />}
            label="Text"
            active={activeTool === "Text"}
            onClick={() => handleToolClick("Text")}
          />
          <ToolbarButton
            icon={<Pen className="h-5 w-5" />}
            label="Canvas"
            active={activeTool === "Canvas"}
            onClick={() => handleToolClick("Canvas")}
          />
          {/* cavas bar */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={paintTool === "Pen" ? "secondary" : "ghost"}
                size="icon"
                className="h-10 w-10 rounded-md"
                onClick={() => handlePaintToolClick("Pen")}
              >
                <FaPencilAlt className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className=" flex flex-col w-auto">
              <div className="bg-white rounded-t-lg border-t border-l border-r shadow-sm p-1.5 inline-flex  items-center gap-1 ${className}">
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[0] }}
                    />
                  }
                  label={showColor[0]}
                  active={toolColor === showColor[0]}
                  onClick={() => handleToolColorClick(showColor[0])}
                />
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[1] }}
                    />
                  }
                  label={showColor[1]}
                  active={toolColor === showColor[1]}
                  onClick={() => handleToolColorClick(showColor[1])}
                />
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[2] }}
                    />
                  }
                  label={showColor[2]}
                  active={toolColor === showColor[2]}
                  onClick={() => handleToolColorClick(showColor[2])}
                />
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[3] }}
                    />
                  }
                  label={showColor[3]}
                  active={toolColor === showColor[3]}
                  onClick={() => handleToolColorClick(showColor[3])}
                />
              </div>
              <div className="bg-white rounded-b-lg border-b border-l border-r shadow-sm p-1.5 inline-flex  items-center gap-1 ${className}">
                <PaintButton
                  icon={<div className="h-[3px] w-5 bg-black" />}
                  label="3"
                  active={stroke === 3}
                  onClick={() => handleStokeClick(3)}
                />
                <PaintButton
                  icon={<div className="h-[6px] w-5 bg-black " />}
                  label="6"
                  active={stroke === 6}
                  onClick={() => handleStokeClick(6)}
                />
                <PaintButton
                  icon={<div className="h-[9px] w-5 bg-black" />}
                  label="9"
                  active={stroke === 9}
                  onClick={() => handleStokeClick(9)}
                />
                <PaintButton
                  icon={<div className="h-[12px] w-5 bg-black " />}
                  label="12"
                  active={stroke === 12}
                  onClick={() => handleStokeClick(12)}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={paintTool === "Highlight" ? "secondary" : "ghost"}
                size="icon"
                className="h-10 w-10 rounded-md"
                onClick={() => handlePaintToolClick("Highlight")}
              >
                <FaHighlighter className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className=" flex flex-col w-auto">
              <div className="bg-white rounded-t-lg border-t border-l border-r shadow-sm p-1.5 inline-flex  items-center gap-1 ">
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[0] }}
                    />
                  }
                  label={showColor[0]}
                  active={toolColor === showColor[0]}
                  onClick={() => handleToolColorClick(showColor[0])}
                />
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[1] }}
                    />
                  }
                  label={showColor[1]}
                  active={toolColor === showColor[1]}
                  onClick={() => handleToolColorClick(showColor[1])}
                />
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[2] }}
                    />
                  }
                  label={showColor[2]}
                  active={toolColor === showColor[2]}
                  onClick={() => handleToolColorClick(showColor[2])}
                />
                <PaintButton
                  icon={
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: showColor[3] }}
                    />
                  }
                  label={showColor[3]}
                  active={toolColor === showColor[3]}
                  onClick={() => handleToolColorClick(showColor[3])}
                />
              </div>
              <div className="bg-white rounded-b-lg border-b border-l border-r shadow-sm p-1.5 inline-flex  items-center gap-1 ${className}">
                <PaintButton
                  icon={<div className="h-[3px] w-5 bg-black" />}
                  label="3"
                  active={stroke === 3}
                  onClick={() => handleStokeClick(3)}
                />
                <PaintButton
                  icon={<div className="h-[6px] w-5 bg-black " />}
                  label="6"
                  active={stroke === 6}
                  onClick={() => handleStokeClick(6)}
                />
                <PaintButton
                  icon={<div className="h-[9px] w-5 bg-black" />}
                  label="9"
                  active={stroke === 9}
                  onClick={() => handleStokeClick(9)}
                />
                <PaintButton
                  icon={<div className="h-[12px] w-5 bg-black " />}
                  label="12"
                  active={stroke === 12}
                  onClick={() => handleStokeClick(12)}
                />
              </div>
            </PopoverContent>
          </Popover>

          <ToolbarButton
            icon={<PiEraserFill className="h-5 w-5" />}
            label="Eraser"
            active={paintTool === "Eraser"}
            onClick={() => handlePaintToolClick("Eraser")}
          />
        </div>
      </div>
    </div>
  );
}
