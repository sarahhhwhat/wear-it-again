import { TermWindow } from "@/components/TermWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { Droplets, Recycle, CloudFog } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";

const WATER_PER_GARMENT_L = 2700;
const CO2_PER_GARMENT_KG = 8;

/** Formats a number with thousands separators. */
function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function Calculator() {
  const myPoints = useQuery(api.leaderboard.me);
  const [count, setCount] = useState("12");

  const rewears = Math.max(0, Math.min(100000, parseInt(count || "0", 10) || 0));

  // Informational: 10 pts = 1 logged rewear day, shown as a cross-check below
  const pointsBased = Math.floor((myPoints?.points ?? 0) / 10);

  const water = rewears * WATER_PER_GARMENT_L;
  const co2 = rewears * CO2_PER_GARMENT_KG;

  const equivalences = useMemo(
    () => ({
      showers: Math.floor(water / 65), // ~65 L per 8-min shower
      kmDriven: Math.floor(co2 / 0.12), // ~120 g CO2 per km driven
    }),
    [water, co2],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> ./impact-calc --run
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Impact Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Rewearing instead of buying new. Estimates: <span className="text-foreground">2,700 L water</span> and <span className="text-foreground">8 kg CO2</span> per new garment avoided.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <TermWindow title="calc --input">
          <label
            htmlFor="rewears"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            how many times have you reworn an item?
          </label>
          <Input
            id="rewears"
            type="number"
            min={0}
            max={100000}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="mt-2"
            inputMode="numeric"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Enter the number of extra wears of any garment — e.g. reworn a tee
            12 times instead of buying 12 new ones.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[5, 12, 30, 52, 100].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="sm"
                onClick={() => setCount(String(n))}
              >
                {n}×
              </Button>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            <p>
              cross-check: your logged rewear points imply ~
              <span className="text-foreground">{pointsBased}</span> rewears so
              far — does your number match?
            </p>
          </div>
        </TermWindow>

        <TermWindow title="calc --output" className="bg-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-muted/60 p-5">
              <div className="flex items-center gap-2 text-ok">
                <Droplets className="size-5" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  water saved
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {fmt(water)} <span className="text-lg text-muted-foreground">L</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ≈ {fmt(equivalences.showers)} eight-minute showers
              </p>
            </div>
            <div className="rounded-md border border-border bg-muted/60 p-5">
              <div className="flex items-center gap-2 text-ok">
                <CloudFog className="size-5" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  CO2 avoided
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {fmt(co2)} <span className="text-lg text-muted-foreground">kg</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ≈ {fmt(equivalences.kmDriven)} km not driven
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-md border border-ok/30 bg-ok/5 p-4 text-sm">
            <Recycle className="mt-0.5 size-5 shrink-0 text-ok" />
            <p className="text-muted-foreground">
              Based on{" "}
              <span className="font-semibold text-foreground">
                {fmt(rewears)}
              </span>{" "}
              rewears, you avoided roughly{" "}
              <span className="font-semibold text-foreground">
                {fmt(rewears)}
              </span>{" "}
              new garments — that's {fmt(water)} litres of water and{" "}
              {fmt(co2)} kg of CO2 that never had to exist.
            </p>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Assumptions: 2,700 L water and 8 kg CO2 per new garment (industry
            averages). Your actual numbers vary by fabric, size, and washing
            habits.
          </p>
        </TermWindow>
      </div>
    </div>
  );
}
