import { TermWindow } from "@/components/TermWindow";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { Link } from "react-router";

const TIMELINE = [
  {
    range: "weeks 1-2",
    title: "Launch + ambassador recruitment",
    desc: "Campaign kicks off across campus. Students sign up as rewear ambassadors and recruit their floors, clubs and friend groups.",
  },
  {
    range: "week 3",
    title: "Guest brand talk",
    desc: "A brand rep joins to talk supply chains, materials and how to read sustainability claims without falling for greenwashing.",
  },
  {
    range: "week 4",
    title: "Clothing swap event",
    desc: "Bring what you don't wear, take what you will. The swap board app mirrors the event so items move all week.",
  },
  {
    range: "week 5",
    title: "Repair café + upcycling",
    desc: "Sewing stations and repair help for torn seams and missing buttons — plus upcycling tables for the creatively brave.",
  },
  {
    range: "week 6",
    title: "Style + rewear wrap-up",
    desc: "Restyling workshops celebrate what's already hanging in your wardrobe. Outfit challenges crown the most reworn looks.",
  },
  {
    range: "week 7",
    title: "Results shared",
    desc: "Total rewears, swaps, water and CO2 saved — tallied and shared with the whole campus.",
  },
];

export default function About() {
  // Week 4-ish is "in progress" in this demo; tweak as the campaign runs.
  const currentWeek = 4;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> cat about.md
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">About</h1>
      </div>

      <TermWindow title="about --story">
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Wear It Again</span>{" "}
            started with a simple observation: the most sustainable garment is
            the one already in your wardrobe. Fast fashion has made clothes feel
            disposable — but every extra wear of something you already own is a
            garment that never needed to be made.
          </p>
          <p>
            Over seven weeks, the campus comes together to swap, repair,
            restyle and — most importantly — rewear. Students post clothes on
            the swap board, log daily rewears for points, and watch the saved
            litres and kilograms stack up.
          </p>
          <p>
            The campaign ends with results shared openly: rewears logged,
            garments swapped, water saved, CO2 avoided. Small habits, measured
            honestly, add up.
          </p>
        </div>
      </TermWindow>

      <TermWindow title="timeline --7-weeks" bodyClassName="p-4 sm:p-6">
        <ol className="relative ml-3 space-y-8 border-l border-border pl-6">
          {TIMELINE.map((item, i) => {
            const week = i + 1;
            const done = week < currentWeek;
            const active = week === currentWeek;
            return (
              <li key={item.range} className="relative">
                <span
                  className={`absolute -left-[31px] flex size-[22px] items-center justify-center rounded-full border bg-card ${
                    done
                      ? "border-ok/40 bg-ok/10 text-ok"
                      : active
                        ? "border-warn/50 bg-warn/10 text-warn"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : active ? (
                    <CircleDot className="size-3.5" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-ok">
                  {item.range}
                </p>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
                {active && (
                  <span className="mt-2 inline-block rounded-sm bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
                    ● current week
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </TermWindow>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to="/dashboard">join the challenge</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/swap-board">browse the swap board</Link>
        </Button>
      </div>
    </div>
  );
}
