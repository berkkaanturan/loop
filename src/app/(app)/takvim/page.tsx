import { CalendarDays } from "lucide-react";

export default function TakvimPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 pt-safe min-h-[60vh]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <CalendarDays className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-xl font-bold">Takvim</h1>
      <p className="text-sm text-muted-foreground text-center max-w-[240px]">
        Ödeme takviminiz burada görüntülenecek.
      </p>
    </div>
  );
}
