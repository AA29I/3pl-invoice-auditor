import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-[#777268] tracking-tight">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              "w-full rounded border border-[#DCD5C8] bg-white px-3 py-2 text-xs text-[#121210] focus:border-[#B8892D] focus:outline-none focus:ring-1 focus:ring-[#B8892D] disabled:bg-[#F3F0E8] disabled:text-[#777268]",
              error && "border-[#8f2020] focus:border-[#8f2020] focus:ring-[#8f2020]",
              className
            )
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-[11px] text-[#8f2020]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
