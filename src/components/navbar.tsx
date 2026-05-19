"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  BookOpenTextIcon,
  BookBookmark01Icon,
  Setting06Icon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV: { href: string; label: string; icon: IconSvgElement }[] = [
  { href: "/",          label: "Bibliotheque", icon: BookOpenTextIcon },
  { href: "/bookmarks", label: "Marque-pages", icon: BookBookmark01Icon },
  { href: "/settings",  label: "Parametres",   icon: Setting06Icon },
];

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 text-sm font-bold shrink-0">
          <span className="text-xl">☪️</span>
          <span className="text-primary">Ihsan</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Button
                key={href}
                asChild
                size="sm"
                variant={active ? "default" : "ghost"}
                className={cn(!active && "text-muted-foreground")}
              >
                <Link href={href}>
                  <HugeiconsIcon icon={icon} data-icon="inline-start" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {mounted && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title={resolvedTheme === "dark" ? "Mode clair" : "Mode sombre"}
          >
            {resolvedTheme === "dark"
              ? <HugeiconsIcon icon={Sun01Icon} />
              : <HugeiconsIcon icon={Moon01Icon} />
            }
          </Button>
        )}
      </div>
    </header>
  );
}
