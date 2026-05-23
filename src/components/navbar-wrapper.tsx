"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

/** Masque la navbar sur les pages /reader/* et /login */
export function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/reader/") || pathname.startsWith("/login")) return null;
  return <Navbar />;
}
