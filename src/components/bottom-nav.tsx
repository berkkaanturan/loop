"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  LayoutList,
  CalendarDays,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/abonelikler", label: "Abonelikler", icon: LayoutList },
  { href: "/takvim", label: "Takvim", icon: CalendarDays },
  { href: "/profil", label: "Profil", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div
        className="flex h-14 items-center gap-2 rounded-full border px-4 shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: "var(--app-nav-bg)",
          borderColor: "var(--app-surface-border)",
        }}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex h-10 w-12 items-center justify-center rounded-full tap-highlight-transparent"
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "rgba(127,127,127,0.15)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "relative z-10 h-[22px] w-[22px] transition-colors duration-200",
                  isActive
                    ? "text-[var(--app-text-primary)]"
                    : "text-[var(--app-text-secondary)]"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
