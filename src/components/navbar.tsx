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
  Logout01Icon,
  Menu01Icon,
  ComputerIcon,
  HandsClappingIcon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// TODO: réactiver l'entrée "Apprendre" + le streak quand la phase 12 sera complète
const NAV: { href: string; key: "library" | "bookmarks" | "azkar" | "settings"; icon: IconSvgElement }[] = [
  { href: "/",           key: "library",   icon: BookOpenTextIcon },
  { href: "/azkar",      key: "azkar",     icon: HandsClappingIcon },
  { href: "/bookmarks",  key: "bookmarks", icon: BookBookmark01Icon },
  { href: "/settings",   key: "settings",  icon: Setting06Icon },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" title={t.nav.menu} className="text-muted-foreground">
                <HugeiconsIcon icon={Menu01Icon} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

              {/* — Langue (sous-menu) — */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={Globe02Icon} className="size-4 text-muted-foreground" />
                  <span className="flex-1">{t.settings.language}</span>
                  <span className="text-xs text-muted-foreground">{LOCALE_NAMES[locale]}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                      {LOCALES.map((l) => (
                        <DropdownMenuRadioItem key={l} value={l}>
                          {LOCALE_NAMES[l]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* — Thème (sous-menu) — */}
              {mounted && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <HugeiconsIcon
                      icon={theme === "dark" ? Moon01Icon : theme === "light" ? Sun01Icon : ComputerIcon}
                      className="size-4 text-muted-foreground"
                    />
                    <span className="flex-1">{t.settings.theme}</span>
                    <span className="text-xs text-muted-foreground">
                      {theme === "light" ? t.settings.themeLight : theme === "dark" ? t.settings.themeDark : t.settings.themeSystem}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                        <DropdownMenuRadioItem value="light">
                          <HugeiconsIcon icon={Sun01Icon} className="size-4" />
                          {t.settings.themeLight}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                          <HugeiconsIcon icon={Moon01Icon} className="size-4" />
                          {t.settings.themeDark}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          <HugeiconsIcon icon={ComputerIcon} className="size-4" />
                          {t.settings.themeSystem}
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}

              <DropdownMenuSeparator />

              {/* — Déconnexion — */}
              <DropdownMenuItem
                destructive
                onSelect={async () => {
                  await fetch("/api/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
              >
                <HugeiconsIcon icon={Logout01Icon} className="size-4" />
                {t.login.logout}
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
