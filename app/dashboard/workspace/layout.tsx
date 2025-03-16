"use client";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNodeStore } from "@/store/nodes-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { progress, isRestoring } = useNodeStore((state) => state);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  return (
    <SidebarProvider>
      {isRestoring && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
          <div className="w-full max-w-md space-y-4 text-center px-6">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-muted-foreground">
              {progress < 100 ? "Loading..." : "Complete!"}
            </p>
          </div>
        </div>
      )}
      <SidebarLeft />
      <SidebarInset>
        <header className="fixed top-0 flex h-16 shrink-0 items-center gap-2 bg-background z-50 w-full">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  brain-note & workplace
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Separator orientation="vertical" className="ml-2 h-4" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className=" "
          >
            <PanelRight className="h-5 w-5" />
          </Button>
        </header>

        <div className="fixed top-0 left-0">
          <main className="">{children}</main>
        </div>
      </SidebarInset>

      <SidebarRight rightSidebarOpen={rightSidebarOpen} />
    </SidebarProvider>
  );
}
