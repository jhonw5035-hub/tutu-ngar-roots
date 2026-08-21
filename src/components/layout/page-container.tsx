import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-3xl px-4 py-6 pb-28 sm:py-8", className)}>
      {children}
    </main>
  );
}
