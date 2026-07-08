import {
  SUPPORT_REQUEST_STATUS_COLORS,
  SUPPORT_REQUEST_STATUS_LABELS,
  type SupportRequestStatus,
} from "@/lib/supportRequests";

interface SupportStatusBadgeProps {
  status: SupportRequestStatus;
}

export default function SupportStatusBadge({ status }: SupportStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SUPPORT_REQUEST_STATUS_COLORS[status]}`}
    >
      {SUPPORT_REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
