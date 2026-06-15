import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Main content — scrollable, padded away from bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Fixed bottom navigation */}
      <BottomNav />
    </>
  );
}
