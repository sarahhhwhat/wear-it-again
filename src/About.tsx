import { TermWindow } from "@/components/TermWindow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

// Qualitative findings from the campus survey that inspired this project.
// Add exact percentages here once you have them (don't guess numbers).
const SURVEY_FINDINGS = [
  {
    title: "Awareness is not the problem",
    desc: "Most students rated themselves very or somewhat aware of fast fashion's impact.",
  },
  {
    title: "Barriers are practical",
    desc: "Price, limited availability and doubt about which brands are genuinely sustainable keep students from acting on what they know.",
  },
  {
    title: "People want transparency",
    desc: "Students asked how clothes are made, not just whether they are labelled sustainable.",
  },
];

const FLOW = [
  {
    step: "1 · rewear",
    title: "Wear what you own",
    desc: "Log a rewear each day, keep your streak and see the water and CO₂ you never spent.",
    to: "/rewear",
  },
  {
    step: "2 · swap",
    title: "Pass it on, find something new to you",
    desc: "List pieces you no longer wear on the swap board and claim what you will.",
    to: "/swap-board",
  },
  {
    step: "3 · buy right",
    title: "Check the claim before you buy",
    desc: "Paste a brand's sustainability claim and get a plain-language read on vague wording and what to verify.",
    to: "/greenwash-check",
  },
];

export default function About() {
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
            is built on a simple observation: the most sustainable garment is
            the one already hanging in your wardrobe. Fast fashion has trained
            us to treat clothes as disposable — but every extra wear of
            something you already own is a garment that never needed to be
            manufactured.
          </p>
          <p>
            It&apos;s for everyone. Post the pieces you&apos;re ready to part
            with, search the catalog for your next favorite thing, and log a
            rewear each day to keep your streak alive. As items change hands,
            the app tallies the water and CO₂ saved — 2,700 litres and 8
            kilograms for every garment kept in rotation instead of replaced.
          </p>
        </div>
      </TermWindow>

      <TermWindow title="problem --survey-findings">
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The idea started with a survey of students. People already care; the
          gap is between caring and acting.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {SURVEY_FINDINGS.map((f) => (
            <div
              key={f.title}
              className="rounded-sm border border-border bg-muted/40 p-4"
            >
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </TermWindow>

      <TermWindow title="how-it-works --flow">
        <ol className="grid gap-4 sm:grid-cols-3">
          {FLOW.map((f) => (
            <li key={f.step}>
              <Link
                to={f.to}
                className="block h-full rounded-sm border border-border p-4 transition-colors hover:bg-muted/60"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-ok">
                  {f.step}
                </p>
                <h3 className="mt-1 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </TermWindow>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to="/dashboard">go to dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/swap-board">browse the swap board</Link>
        </Button>
      </div>
    </div>
  );
}
