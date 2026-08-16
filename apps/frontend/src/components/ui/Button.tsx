import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

const variants = {
  primary: "bg-ink text-canvas hover:bg-white disabled:bg-ink3",
  secondary: "bg-surface2 text-ink border border-line2 hover:bg-[#202024]",
  ghost: "text-ink2 hover:text-ink hover:bg-surface2",
  danger: "bg-[#3a1719] text-[#f2b8b5] border border-[#4a2023] hover:bg-[#48181b]",
};

const sizes = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-8 px-3 text-sm gap-1.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded font-medium transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
