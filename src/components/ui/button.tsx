import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8892D] focus:ring-offset-1 focus:ring-offset-[#FBFAF6] disabled:opacity-40 disabled:pointer-events-none rounded";

    const variantStyles = {
      primary: "bg-[#121210] text-[#FBFAF6] hover:bg-[#090908] border border-[#090908]",
      gold: "bg-[#B8892D] text-[#090908] font-semibold hover:bg-[#a67a26] border border-[#a67a26]",
      secondary: "bg-[#F3F0E8] text-[#121210] hover:bg-[#e9e4d8] border border-[#DCD5C8]",
      outline:
        "border border-[#DCD5C8] bg-transparent text-[#121210] hover:bg-[#F3F0E8] hover:border-[#777268]",
      ghost: "text-[#777268] hover:bg-[#F3F0E8] hover:text-[#121210]",
      danger: "bg-[#8f2020] text-white hover:bg-[#731919] border border-[#731919]",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 tracking-tight",
      md: "text-xs px-4 py-2 gap-2 tracking-tight",
      lg: "text-sm px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
