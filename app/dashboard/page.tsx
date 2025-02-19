import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashBoardPage() {
  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome to the dashboard!</p>
      <Link href={"/dashboard/workspace"}>
        <Button>Go to workspace</Button>
      </Link>
    </div>
  );
}
