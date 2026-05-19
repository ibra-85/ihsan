"use client";

import dynamic from "next/dynamic";

const NavbarWrapper = dynamic(
  () => import("./navbar-wrapper").then(m => ({ default: m.NavbarWrapper })),
  {
    ssr: false,
    loading: () => <div className="sticky top-0 z-50 border-b bg-card h-14" />,
  }
);

export function NavbarDynamic() {
  return <NavbarWrapper />;
}
