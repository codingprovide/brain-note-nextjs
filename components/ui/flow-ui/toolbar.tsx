import type React from "react";
import {useState} from "react"
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
import { usePaintToolBarStore, PaintToolBarState } from "@/store/paint-tool-bar-store";
import { FaPencilAlt, FaHighlighter } from "react-icons/fa";
import { PiEraserFill } from "react-icons/pi";
import { BsCursor } from "react-icons/bs";


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

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const [showPaintToolBar, setShowPaintToolBar] = useState(false); 
  const { activeTool, setActiveTool } = useToolBarStore<ToolBarState>(
    (state) => state
  );
  const { paintTool, setPaintTool } = usePaintToolBarStore<PaintToolBarState>(
    (state) => state
  );
  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
    setShowPaintToolBar(tool === "Canvas" ? true : false);

  };
  const handlePaintToolClick = (tool: string) => {
    setPaintTool(tool);
  };
  <Pen />;
  return (
    <div>
      <div
        className={`bg-white rounded-lg border shadow-sm p-1.5 inline-flex items-center gap-1 react-flow__panel bottom center ${className}`}
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
        </div>
      </div>
      {showPaintToolBar && (
        <div
          className={`bg-white rounded-lg border shadow-sm p-1.5 inline-flex items-center gap-1 react-flow__panel top center ${className}`}
        >
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={<FaPencilAlt className="h-5 w-5" />}
              label="Pen"
              active={paintTool === "Pen"}
              onClick={() => handlePaintToolClick("Pen")}
            />
            <ToolbarButton
              icon={<FaHighlighter className="h-5 w-5" />}
              label="Highlight"
              active={paintTool === "Highlight"}
              onClick={() => handlePaintToolClick("Highlight")}
            />
            <ToolbarButton
              icon={<PiEraserFill className="h-5 w-5" />}
              label="Eraser"
              active={paintTool === "Eraser"}
              onClick={() => handlePaintToolClick("Eraser")}
            />
            <ToolbarButton
              icon={<BsCursor className="h-5 w-5" />}
              label="Move"
              active={paintTool === "Move"}
              onClick={() => handlePaintToolClick("Move")}
            />
          </div>
        </div>
      )}
    </div>
    
  );
}
