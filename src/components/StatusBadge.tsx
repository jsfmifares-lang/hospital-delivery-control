import { cn } from "@/lib/utils";
import type { StatusEntrega } from "@/types";

interface StatusBadgeProps {
  status: StatusEntrega;
  className?: string;
}

const statusConfig: Record<
  StatusEntrega,
  { label: string; className: string }
> = {
  Pendente: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Autorizado: {
    label: "Autorizado",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  "Saiu para entrega": {
    label: "Saiu para entrega",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
