"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

/** Masque la navbar sur les pages /reader/* */
export function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/reader/")) return null;
  return <Navbar />;
}
