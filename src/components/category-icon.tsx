import { MonitorSmartphone, Landmark, Coffee, Package } from "lucide-react";
import { ExpenseCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryIcon({ category, className }: { category: ExpenseCategory | "all" | string, className?: string }) {
  const baseClass = cn("shrink-0", className);
  switch (category) {
    case "digital":
      return <MonitorSmartphone className={baseClass} />;
    case "bank":
      return <Landmark className={baseClass} />;
    case "lifestyle":
      return <Coffee className={baseClass} />;
    case "all":
    case "other":
    default:
      return <Package className={baseClass} />;
  }
}
