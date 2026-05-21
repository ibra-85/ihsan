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
  Globe02Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// TODO: réactiver l'entrée "Apprendre" + le streak quand la phase 12 sera complète
const NAV: { href: string; key: "library" | "bookmarks" | "settings"; icon: IconSvgElement }[] = [
  { href: "/",           key: "library",   icon: BookOpenTextIcon },
  { href: "/bookmarks",  key: "bookmarks", icon: BookBookmark01Icon },
  { href: "/settings",   key: "settings",  icon: Setting06Icon },
];

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 text-sm font-bold shrink-0">
          <span className="text-xl">☪️</span>
          <span className="text-primary">Ihsan</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, key, icon }) => {
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
                  <span className="hidden sm:inline">{t.nav[key]}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          {/* Sélecteur de langue */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" title={t.settings.language} className="text-muted-foreground">
                <HugeiconsIcon icon={Globe02Icon} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1">
              {LOCALES.map(l => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={cn(
                    "flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm transition-colors",
                    locale === l ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  )}
                >
                  {LOCALE_NAMES[l]}
                  {locale === l && <HugeiconsIcon icon={Tick01Icon} className="size-4" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Thème */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              title={resolvedTheme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            >
              {resolvedTheme === "dark"
                ? <HugeiconsIcon icon={Sun01Icon} />
                : <HugeiconsIcon icon={Moon01Icon} />
              }
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
