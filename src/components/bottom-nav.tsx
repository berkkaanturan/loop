"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  CalendarDays,
  Plus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/takvim", label: "Takvim", icon: CalendarDays },
  { href: "/ekle", label: "Ekle", icon: Plus, isAction: true },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      id="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 pb-safe"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <div key={item.href} className="relative flex h-full w-16 items-center justify-center">
                {/* 
                  FAB (Floating Action Button) perfectly centered. 
                  It breaks out of the bottom nav boundries using negative margin/absolute positioning 
                */}
                <Link
                  href={item.href}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-transform active:scale-90 hover:scale-105"
                >
                  <Icon className="h-7 w-7 text-white" />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="relative flex h-full min-w-[4rem] flex-1 flex-col items-center justify-center gap-1 tap-highlight-transparent"
            >
              {/* Active indicator with framer-motion */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute top-0 h-[2px] w-8 rounded-full bg-indigo-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isActive ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-zinc-500"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors duration-200",
                  isActive ? "text-indigo-400" : "text-zinc-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
