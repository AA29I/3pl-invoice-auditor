import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#777268] tracking-tight">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              "w-full rounded border border-[#DCD5C8] bg-white px-3 py-2 text-xs text-[#121210] placeholder:text-[#777268]/60 focus:border-[#B8892D] focus:outline-none focus:ring-1 focus:ring-[#B8892D] disabled:bg-[#F3F0E8] disabled:text-[#777268]",
              error && "border-[#8f2020] focus:border-[#8f2020] focus:ring-[#8f2020]",
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-[#8f2020]">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-[#777268]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
