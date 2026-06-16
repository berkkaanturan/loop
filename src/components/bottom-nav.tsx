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

  // Hide bottom nav on specific pages like /ekle if we want to, but for now keep it everywhere except we can handle it later.
  // The image shows it everywhere. Wait, the image shows it floating.
  
  // If the path is /login, we don't render it (already handled by layout)
  
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex h-14 items-center gap-2 rounded-full border border-white/5 bg-[#1C1C1E]/80 px-4 shadow-2xl backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
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
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <Icon
                className={cn(
                  "relative z-10 h-[22px] w-[22px] transition-colors duration-200",
                  isActive ? "text-white" : "text-zinc-500"
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
