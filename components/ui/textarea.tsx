import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-md border border-[#d7c9b8] bg-white px-3 py-2 text-sm text-[#2d2925] outline-none transition focus:border-[#a7642c] focus:ring-2 focus:ring-[#a7642c]/15",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
