import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** The standard surface: a white card with an optional heading row.
 *  `stitched` sews an amber topstitch seam just inside the edge. */
export function Panel({
  title,
  description,
  children,
  className,
  bodyClassName,
  stitched,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  stitched?: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_0_rgba(21,29,59,0.04)]",
        stitched && "stitch",
        className,
      )}
    >
      {title && (
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
