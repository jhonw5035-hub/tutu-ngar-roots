import * as React from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const SESSION_KEY = "ttn-intro-played";

export function TaxiDoorScene() {
  // Start in the animated state only after we know this session hasn't seen it.
  const [revealed, setRevealed] = React.useState(true);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const played = window.sessionStorage.getItem(SESSION_KEY) === "1";
    if (reduced || played) return;
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setAnimate(true);
    setRevealed(false);
    const t = window.setTimeout(() => setRevealed(true), 2600);
    return () => window.clearTimeout(t);
  }, []);

  const skip = React.useCallback(() => {
    setAnimate(false);
    setRevealed(true);
  }, []);

  const state = animate && !revealed ? "playing" : "done";

  return (
    <div
      onClick={skip}
      className="ttn-intro relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      data-state={state}
    >
      <TaxiCar animate={animate} />

      <div
        className={
          state === "playing"
            ? "ttn-intro-reveal mt-8 opacity-0"
            : "mt-8 opacity-100 transition-opacity duration-500"
        }
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-[oklch(0.991_0.006_62)]">
          Tu Tu<span className="text-primary"> Ngar</span>
        </h1>
        <p className="mm mt-1 text-lg text-[oklch(0.991_0.006_62/0.72)]">တူတူငှား</p>
        <p className="mt-4 max-w-xs text-sm text-[oklch(0.991_0.006_62/0.66)]">
          Shared rides across Yangon — booked ahead, priced upfront, and safer together.
        </p>

        <div className={state === "playing" ? "" : "ttn-intro-cta mt-8"}>
          <Button asChild size="lg" className="w-full min-w-[240px]">
            <Link to="/login" onClick={(e) => e.stopPropagation()}>
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function TaxiCar({ animate }: { animate: boolean }) {
  return (
    <svg
      viewBox="0 0 320 170"
      className="w-full max-w-[340px]"
      role="img"
      aria-label="Line-art taxi with its door opening"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className={animate ? "ttn-car text-primary" : "text-primary"}>
        {/* body */}
        <path d="M28 116h264" />
        <path d="M40 116c-8 0-14-6-14-14V86c0-8 6-13 14-15l26-6 26-26c4-4 9-6 15-6h84c6 0 11 2 15 6l26 26 26 6c8 2 14 7 14 15v16c0 8-6 14-14 14" />
        {/* windows */}
        <path d="M96 62h56v-32h-38l-18 32Z" />
        <path d="M168 30h38l18 32h-56V30Z" />
        {/* roof sign */}
        <path d="M140 22h40v-12h-40z" />
        {/* wheels */}
        <circle cx="82" cy="116" r="18" />
        <circle cx="238" cy="116" r="18" />
        {/* lights */}
        <path d="M32 92h16M272 92h16" />
        {/* door */}
        <g className="ttn-door" style={{ transformOrigin: "100px 100px" }}>
          <path d="M100 70h58v42h-58z" />
          <path d="M112 92h14" />
        </g>
      </g>
    </svg>
  );
}
