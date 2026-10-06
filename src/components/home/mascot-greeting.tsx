import * as React from "react";
import { cn } from "@/lib/utils";
import standingAsset from "@/assets/mascot-standing.png.asset.json";
import bowingAsset from "@/assets/mascot-bowing.png.asset.json";

const BOW_EVERY_MS = 4500;
const BOW_HOLD_MS = 1000;

/**
 * Compact greeting mascot for the home header: crossfades from the standing
 * pose to the bowing pose every few seconds. Pure CSS opacity transitions,
 * skipped entirely for reduced-motion users.
 */
export function MascotGreeting({ className }: { className?: string }) {
  const [bowing, setBowing] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let hold: number | undefined;
    // Greet shortly after load, then loop every few seconds.
    const first = window.setTimeout(() => {
      setBowing(true);
      hold = window.setTimeout(() => setBowing(false), BOW_HOLD_MS);
    }, 1200);
    const loop = window.setInterval(() => {
      setBowing(true);
      hold = window.setTimeout(() => setBowing(false), BOW_HOLD_MS);
    }, BOW_EVERY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(loop);
      if (hold) window.clearTimeout(hold);
    };
  }, []);

  return (
    <span className={cn("relative block", className)} aria-hidden="true">
      <img
        src={standingAsset.url}
        alt=""
        draggable={false}
        className={cn(
          "h-full w-full object-contain object-bottom transition-opacity duration-[350ms]",
          bowing && "opacity-0",
        )}
      />
      <img
        src={bowingAsset.url}
        alt=""
        draggable={false}
        className={cn(
          "absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-[350ms]",
          bowing ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}
