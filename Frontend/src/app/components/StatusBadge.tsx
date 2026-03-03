import { Badge } from "./ui/badge";

type StatusType = "ok" | "warning" | "danger" | "offline";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    ok: {
      className: "bg-[#10B981] text-black hover:bg-[#10B981]/90",
      text: label || "OK",
    },
    warning: {
      className: "bg-[#F59E0B] text-black hover:bg-[#F59E0B]/90",
      text: label || "Attention",
    },
    danger: {
      className: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90",
      text: label || "Danger",
    },
    offline: {
      className: "bg-gray-600 text-white hover:bg-gray-600/90",
      text: label || "Hors ligne",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.text}
    </Badge>
  );
}
