import { BottomNav } from "@/components/bottom-nav";
import { ExpensesProvider } from "@/lib/expenses-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ExpensesProvider>
      {/* Main content — scrollable, padded away from bottom nav */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Fixed bottom navigation */}
      <BottomNav />
    </ExpensesProvider>
  );
}
