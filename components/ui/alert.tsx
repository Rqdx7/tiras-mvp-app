import * as React from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md border border-[#d8c2aa] bg-[#fff8ef] px-4 py-3 text-sm text-[#51351f]", className)}
      {...props}
    />
  );
}
