import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/** Small segmented seat-availability indicator: filled vs. open seats. */
export function SeatBar({
  filled,
  capacity,
  className,
}: {
  filled: number;
  capacity: number;
  className?: string;
}) {
  const t = useT();
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`${filled} / ${capacity} ${t("seatsBooked")}`}
    >
      {Array.from({ length: capacity }, (_, i) => (
        <span
          key={i}
          className={cn("h-1.5 flex-1 rounded-full", i < filled ? "bg-primary" : "bg-muted")}
        />
      ))}
    </div>
  );
}
