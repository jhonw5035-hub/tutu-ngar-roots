import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/driver")({
  component: DriverLayout,
});

function DriverLayout() {
  return <Outlet />;
}
