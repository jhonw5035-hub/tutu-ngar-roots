import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old role-select URL — the app is passenger-only now, so send people home. */
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/home", replace: true });
  },
});
