import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
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
    title: "Wear what you own",
    desc: "Log a rewear each day, keep your streak and see the water and CO₂ you never spent.",
    to: "/rewear",
  },
  {
    title: "Pass it on, find something new to you",
    desc: "List pieces you no longer wear on the swap board and claim what you will.",
    to: "/swap-board",
  },
  {
    title: "Check the claim before you buy",
    desc: "Paste a brand's sustainability claim and get a plain-language read on vague wording and what to verify.",
    to: "/greenwash-check",
  },
];

export default function About() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="About Wear It Again"
        description="A campus-built app that turns rewearing into a habit you can see."
      />

      <Panel stitched bodyClassName="p-6 sm:p-8">
        <div className="max-w-2xl space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Wear It Again</span>{" "}
            is built on a simple observation: the most sustainable garment is
            the one already hanging in your wardrobe. Fast fashion has trained
            us to treat clothes as disposable, but every extra wear of
            something you already own is a garment that never needed to be
            manufactured.
          </p>
          <p>
            It&apos;s for everyone. Post the pieces you&apos;re ready to part
            with, search the catalog for your next favorite thing, and log a
            rewear each day to keep your streak alive. As items change hands,
            the app tallies the water and CO₂ saved: 2,700 litres and 8
            kilograms for every garment kept in rotation instead of replaced.
          </p>
        </div>
      </Panel>

      <section>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Where the idea came from
        </h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          It started with a survey of students. People already care; the gap is
          between caring and acting.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SURVEY_FINDINGS.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-display font-semibold">{f.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          How it works
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {FLOW.map((f, i) => (
            <li key={f.title}>
              <Link
                to={f.to}
                className="block h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/50"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display font-semibold">{f.title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to="/dashboard">Go to your dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/swap-board">Browse the swap board</Link>
        </Button>
      </div>
    </div>
  );
}
