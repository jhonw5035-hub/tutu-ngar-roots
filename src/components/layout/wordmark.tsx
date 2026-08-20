import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        Tu Tu<span className="text-primary"> Ngar</span>
      </span>
      <span className="mm text-sm text-muted-foreground">တူတူငှား</span>
    </span>
  );
}