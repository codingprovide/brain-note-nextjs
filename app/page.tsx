import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="text-2xl font-bold">Welcome to the BrainNote</h1>
      <p className="mt-2">
        <Link href={"/dashboard"}>
          <Button>start now</Button>
        </Link>
      </p>
    </div>
  );
}
