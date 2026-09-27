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
    desc: "Post clothes you no longer wear. Claim what you'll actually wear again.",
  },
  {
    to: "/rewear",
    icon: Repeat2,
    title: "rewear_challenge",
    desc: "One rewear a day. +10 points. Climb the campus leaderboard.",
  },
  {
    to: "/calculator",
    icon: Calculator,
    title: "impact_calc",
    desc: "See the water and CO2 you save by rewearing instead of rebuying.",
  },
  {
    to: "/ai-chat",
    icon: MessageSquareText,
    title: "ai_chat",
    desc: "Ask about brands, materials, repair — grounded sustainable-fashion answers.",
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
          <nav className="flex items-center gap-1 overflow-x-auto term-scroll text-xs">
            <a href="#features" className="hidden rounded-sm px-2.5 py-1.5 text-muted-foreground hover:text-foreground sm:block">
              features
            </a>
            <a href="#timeline" className="hidden rounded-sm px-2.5 py-1.5 text-muted-foreground hover:text-foreground sm:block">
              about
            </a>
            <Link
              to={primary}
              className="ml-2 rounded-sm bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isAuthenticated ? "open terminal" : "$ get started"}
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
              campus sustainable-fashion campaign
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Wear it again.
              <br />
              <span className="text-ok term-cursor">Then wear it again</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              A seven-week campaign to make rewearing the default. Swap clothes
              you no longer wear, log daily rewears, and see your real impact —
              measured in litres and kilograms, not likes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-11 px-6 font-semibold" asChild>
                <Link to={primary}>
                  {isAuthenticated
                    ? "Continue to your terminal"
                    : "Join the campaign"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                <a href="#features">see what's inside</a>
              </Button>
            </div>

            {/* boot log */}
            <div className="mt-10 max-w-lg rounded-md border border-border bg-card p-4 text-xs leading-6">
              <p className="text-muted-foreground">
                <span className="text-ok">[ ok ]</span> swap board online
              </p>
              <p className="text-muted-foreground">
                <span className="text-ok">[ ok ]</span> rewear challenge: +10/day
              </p>
              <p className="text-muted-foreground">
                <span className="text-ok">[ ok ]</span> impact calc calibrated
              </p>
              <p className="text-muted-foreground">
                <span className="text-warn">[ .. ]</span> ai assistant ready…
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            // programs
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Four ways to wear it again
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
                  <TermWindow title={`~/${f.title}`} className="h-full transition-shadow hover:shadow-md">
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
            { k: "2,700 L", v: "water saved per reworn tee instead of new" },
            { k: "8 kg", v: "CO2 avoided per garment you don't buy new" },
            { k: "7 weeks", v: "of swaps, repair cafés and rewearing" },
          ].map((s) => (
            <div key={s.k}>
              <p className="text-3xl font-bold tabular-nums text-ok">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* about teaser + CTA */}
      <section id="timeline" className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                // the campaign
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Seven weeks. One wardrobe at a time.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                From ambassador recruitment to the final results share-out, the
                campaign runs a guest brand talk, a clothing swap event, a
                repair café and more.
              </p>
            </div>
            <Button variant="outline" size="lg" className="shrink-0" asChild>
              <Link to="/about">
                read the timeline <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} wear-it-again — campus campaign</span>
          <span>
            exit code <span className="text-ok">0</span> · reworn, not reborn
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
