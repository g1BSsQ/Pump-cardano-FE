import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  integerOnly?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, integerOnly, onKeyDown, onChange, max, ...props }, ref) => {
    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (type === "number") {
        let allowed: boolean;
        if (integerOnly) {
          allowed = /^[0-9]$/.test(e.key);
        } else {
          allowed = /^[0-9.]$/.test(e.key);
        }
        const control = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key);
        if (!allowed && !control) {
          e.preventDefault();
        }
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (type === "number" && max !== undefined && e.target.value !== "") {
        const num = parseFloat(e.target.value);
        const maxVal = typeof max === "number" ? max : parseFloat(max);
        if (!isNaN(num) && !isNaN(maxVal) && num > maxVal) {
          e.target.value = maxVal.toString();
        }
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          type === "number" ? "appearance-none" : "",
          className,
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        max={max}
        {...props}
      />
    );
  },

);
Input.displayName = "Input";

export { Input };


