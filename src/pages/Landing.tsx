import { Button } from "@/components/ui/button";
import { TermWindow } from "@/components/TermWindow";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  MessageSquareText,
  Repeat2,
  Shuffle,
} from "lucide-react";
import { Link } from "react-router";

const FEATURES = [
  {
    to: "/swap-board",
    icon: Shuffle,
    title: "swap_board",
    desc: "List what you no longer wear, claim what you will. Every swap keeps a garment in circulation.",
  },
  {
    to: "/rewear",
    icon: Repeat2,
    title: "rewear_challenge",
    desc: "One logged rewear a day, ten points each. Watch your streak — and the leaderboard — climb.",
  },
  {
    to: "/calculator",
    icon: Calculator,
    title: "impact_calc",
    desc: "Turn rewears into litres of water and kilograms of CO₂ you never spent.",
  },
  {
    to: "/ai-chat",
    icon: MessageSquareText,
    title: "ai_chat",
    desc: "'Is this brand actually sustainable?' Ask. Get a straight answer, not a slogan.",
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const primary = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background"
    >
      {/* top bar */}
      <header className="border-b border-border bg-card/95">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-sm border border-border bg-ok/10 text-ok font-bold">
              ♻
            </span>
            <span className="font-semibold tracking-tight">wear-it-again</span>
          </div>
          <nav className="flex items-center gap-1 text-xs">
            <a
              href="#features"
              className="hidden rounded-sm px-2.5 py-1.5 text-muted-foreground hover:text-foreground sm:block"
            >
              features
            </a>
            <Link
              to="/about"
              className="hidden rounded-sm px-2.5 py-1.5 text-muted-foreground hover:text-foreground sm:block"
            >
              about
            </Link>
            <Link
              to={primary}
              className="term-glow ml-2 rounded-sm bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isAuthenticated ? "open your dashboard" : "$ join free"}
            </Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="term-grid border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-ok">
              wear it again — the rewearing movement
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              The most sustainable outfit
              <br />
              <span className="text-ok term-cursor">is the one you own.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Wear It Again turns rewearing into a habit you can see. Swap
              clothes with others, log each day you rewear something, and watch
              the water and carbon you save stack up in real numbers.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="term-glow h-11 px-6 font-semibold" asChild>
                <Link to={primary}>
                  {isAuthenticated
                    ? "back to your dashboard"
                    : "start rewearing — it's free"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                <a href="#features">see how it works</a>
              </Button>
            </div>

            {/* boot log */}
            <div className="mt-10 max-w-lg rounded-md border border-border bg-card p-4 text-xs leading-6">
              <p className="text-muted-foreground">
                <span className="text-ok">[ ok ]</span> swap board: online
              </p>
              <p className="text-muted-foreground">
                <span className="text-ok">[ ok ]</span> rewear challenge: +10
                pts/day
              </p>
              <p className="text-muted-foreground">
                <span className="text-ok">[ ok ]</span> impact calc: 2,700 L ·
                8 kg CO₂ per garment
              </p>
              <p className="text-muted-foreground">
                <span className="text-warn">[ .. ]</span> your first rewear:
                waiting for you
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            // what's inside
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Small habit. Measurable impact.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.to}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link to={f.to}>
                  <TermWindow
                    title={`~/${f.title}`}
                    className="h-full transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-border bg-ok/10 text-ok">
                        <f.icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          <span className="text-ok">./</span>
                          {f.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </TermWindow>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* numbers strip */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
          {[
            {
              k: "2,700 L",
              v: "of water kept in the ground for every new garment you skip",
            },
            {
              k: "8 kg",
              v: "of CO₂ that never enters the air, per garment reworn instead of bought",
            },
            {
              k: "∞",
              v: "wears left in the clothes already hanging in your wardrobe",
            },
          ].map((s) => (
            <div key={s.k}>
              <p className="text-3xl font-bold tabular-nums text-ok">{s.k}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {s.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* closing CTA */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                // why it matters
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Fashion's footprint is huge. Your wardrobe is the fix.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Producing one new garment costs the planet thousands of litres
                of water and kilograms of CO₂. Wearing what you already own
                costs nothing — and now you can prove it, one logged rewear at
                a time.
              </p>
            </div>
            <Button variant="outline" size="lg" className="shrink-0" asChild>
              <Link to="/about">
                read the campaign story <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Wear It Again — reworn, not reborn</span>
          <span>
            exit code <span className="text-ok">0</span> · wardrobe: unchanged,
            impact: changed
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
