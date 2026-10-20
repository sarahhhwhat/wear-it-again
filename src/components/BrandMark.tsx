import logo from "@/assets/logo.svg";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img src={logo} alt="" width={32} height={32} className="size-8 rounded-lg" />
      <span className="font-display text-lg font-bold tracking-tight">
        Wear It Again
      </span>
    </span>
  );
}
