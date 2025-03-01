import type React from "react";
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
  const { activeTool, setActiveTool } = useToolBarStore<ToolBarState>(
    (state) => state
  );
  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
  };
  <Pen />;
  return (
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
      </div>
    </div>
  );
}
