import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "warning" | "danger" | "neutral" | "ink";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#F3F0E8] text-[#121210] border-[#DCD5C8]",
    gold: "bg-[#F3F0E8] text-[#B8892D] border-[#E0BC68] font-semibold",
    warning: "bg-[#F3F0E8] text-[#B8892D] border-[#DCD5C8]",
    danger: "bg-[#fdf2f2] text-[#8f2020] border-[#f1c2c2]",
    neutral: "bg-[#FBFAF6] text-[#777268] border-[#DCD5C8]",
    ink: "bg-[#121210] text-[#FBFAF6] border-[#090908]",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-tight border",
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
