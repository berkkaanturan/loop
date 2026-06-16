"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Droplet, Flame, Home, Zap, CreditCard, Dumbbell,
  ShoppingCart, Apple, Fuel, Bus, Globe, Smartphone,
  Banknote, Building2, Sparkles, PawPrint, Cat, HeartPulse, TrendingUp
} from "lucide-react";

const LUCIDE_ICONS: Record<string, React.ElementType> = {
  Droplet, Flame, Home, Zap, CreditCard, Dumbbell,
  ShoppingCart, Apple, Fuel, Bus, Globe, Smartphone,
  Banknote, Building2, Sparkles, Paw: PawPrint, Cat, HeartPulse, TrendingUp
};

interface BrandLogoProps {
  domain?: string;
  name: string;
  fallbackIcon?: string;
  fallbackColor?: string;
  className?: string;
  iconClassName?: string;
}

export function BrandLogo({
  domain,
  name,
  fallbackIcon,
  fallbackColor,
  className,
  iconClassName,
}: BrandLogoProps) {
  const [errorDomain, setErrorDomain] = useState<string | undefined>(undefined);

  const hasError = !domain || errorDomain === domain;

  if (!hasError && domain) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden rounded-xl", className)}>
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt={`${name} logo`}
          className="block h-full w-full"
          onError={() => setErrorDomain(domain)}
        />
      </div>
    );
  }

  // Fallback state: Lucide icon or initial letter
  const IconComponent = fallbackIcon ? LUCIDE_ICONS[fallbackIcon] : null;
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden rounded-xl",
        fallbackColor || "bg-zinc-800",
        className
      )}
    >
      {IconComponent ? (
        <IconComponent className={cn("h-full w-full p-2.5 text-white drop-shadow-sm", iconClassName)} />
      ) : (
        <span className={cn("text-xl font-bold text-white drop-shadow-sm", iconClassName)}>
          {initial}
        </span>
      )}
    </div>
  );
}
