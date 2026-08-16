import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-5">
      <div>
        {breadcrumb && <div className="flex items-center gap-1 text-xs text-ink3">{breadcrumb}</div>}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-ink">{title}</h1>
        </div>
      </div>
      {action}
    </div>
  );
}
