"use client";

import { MoreHorizontal } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

import { FileText, User } from "lucide-react";
interface Document {
  id: string;
  title?: string;
  authors?: string;
  abstract?: string;
  pdfUrl: string;
  userId: string;
  fileName: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export function NavMyPaper({
  papers,
  loading,
}: {
  papers: Document[];
  loading: boolean;
}) {
  const [selectedPaper, setSelectedPaper] = useState<(typeof papers)[0] | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (paper: (typeof papers)[0]) => {
    setSelectedPaper(paper);
    setIsDialogOpen(true);
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>My Papers</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {papers.length > 0 &&
              papers.map((paper) => (
                <SidebarMenuItem key={paper.id}>
                  <SidebarMenuButton className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium truncate w-full">
                        {paper.title ? paper.title : paper.fileName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {paper.authors ? paper.authors : "Unknown"}
                      </span>
                    </div>
                  </SidebarMenuButton>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuAction
                        onClick={() => handleViewDetails(paper)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </SidebarMenuAction>
                    </TooltipTrigger>
                    <TooltipContent side="right">View details</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}

            {loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            )}
            {papers.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No papers found
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Paper Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedPaper?.title || "Untitled"}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-1 mt-1">
                <User className="h-3 w-3" />
                <span>{selectedPaper?.authors || "Unknown"}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="abstract" className="text-sm font-medium">
                Abstract
              </Label>
              <div id="abstract" className="mt-1 text-sm">
                {selectedPaper?.abstract || "No abstract"}
              </div>
            </div>
            <div>
              <Label htmlFor="filename" className="text-sm font-medium">
                File
              </Label>
              <div
                id="filename"
                className="mt-1 text-sm flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {selectedPaper?.fileName}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
