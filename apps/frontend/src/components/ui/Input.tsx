import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`h-8 w-full rounded border border-line2 bg-surface2 px-2.5 text-sm text-ink placeholder:text-ink3 outline-none transition-colors focus:border-ink3 disabled:opacity-50 ${className}`}
    {...props}
  />
));
Input.displayName = "Input";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink2">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-ink3">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}
