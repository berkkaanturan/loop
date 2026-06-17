import { MonitorSmartphone, Landmark, Coffee, Package, Plane, Sparkles, Layers } from "lucide-react";
import { ExpenseCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryIcon({ category, className }: { category: ExpenseCategory | "all" | string, className?: string }) {
  const baseClass = cn("shrink-0", className);
  switch (category) {
    case "digital":
      return <MonitorSmartphone className={baseClass} />;
    case "bank":
      return <Landmark className={baseClass} />;
    case "social":
      return <Coffee className={baseClass} />;
    case "travel":
      return <Plane className={baseClass} />;
    case "personal_care":
      return <Sparkles className={baseClass} />;
    case "all":
      return <Layers className={baseClass} />;
    case "other":
    default:
      return <Package className={baseClass} />;
  }
}
