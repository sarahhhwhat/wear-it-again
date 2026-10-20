import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CloudFog, Droplets } from "lucide-react";
import { useMemo, useState } from "react";

const WATER_PER_GARMENT_L = 2700;
const CO2_PER_GARMENT_KG = 8;

/** Formats a number with thousands separators. */
function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function Result({
  icon: Icon,
  label,
  value,
  unit,
  note,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
  unit: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/70 p-5">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="size-5" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 font-display text-4xl font-bold tabular-nums">
        {value} <span className="text-xl text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Impact calculator"
        description="Every rewear you choose over a new purchase avoids roughly 2,700 L of water and 8 kg of CO₂."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Panel title="Your rewears">
          <label htmlFor="rewears" className="text-sm font-medium">
            How many times have you reworn an item instead of buying new?
          </label>
          <Input
            id="rewears"
            type="number"
            min={0}
            max={100000}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="mt-2 h-11"
            inputMode="numeric"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Count extra wears of any garment. Wearing a tee 12 more times
            instead of buying 12 new ones is 12.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[5, 12, 30, 52, 100].map((n) => (
              <Button
                key={n}
                variant={String(n) === count ? "default" : "outline"}
                size="sm"
                onClick={() => setCount(String(n))}
              >
                {n}×
              </Button>
            ))}
          </div>

          <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
            Your logged rewear points add up to about{" "}
            <span className="font-semibold text-foreground">{pointsBased}</span>{" "}
            rewears so far. Does your number match?
          </p>
        </Panel>

        <Panel title="What you saved" stitched>
          <div className="grid gap-4 sm:grid-cols-2">
            <Result
              icon={Droplets}
              label="Water saved"
              value={fmt(water)}
              unit="L"
              note={`About ${fmt(equivalences.showers)} eight-minute showers`}
            />
            <Result
              icon={CloudFog}
              label="CO₂ avoided"
              value={fmt(co2)}
              unit="kg"
              note={`About ${fmt(equivalences.kmDriven)} km not driven`}
            />
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">
            With{" "}
            <span className="font-semibold text-foreground">{fmt(rewears)}</span>{" "}
            rewears you avoided roughly{" "}
            <span className="font-semibold text-foreground">{fmt(rewears)}</span>{" "}
            new garments: {fmt(water)} litres of water and {fmt(co2)} kg of CO₂
            that never had to exist.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            Assumes 2,700 L of water and 8 kg of CO₂ per new garment (industry
            averages). Real numbers vary by fabric, size and washing habits.
          </p>
        </Panel>
      </div>
    </div>
  );
}
