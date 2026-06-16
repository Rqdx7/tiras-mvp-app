import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-[#d7c9b8] bg-white px-3 text-sm text-[#2d2925] outline-none transition focus:border-[#a7642c] focus:ring-2 focus:ring-[#a7642c]/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
