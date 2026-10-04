import { TermWindow } from "@/components/TermWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, ScanSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Verdict = "credible" | "mixed" | "vague" | "insufficient";

type Result = {
  verdict: Verdict;
  summary: string;
  redFlags: { pattern: string; quote: string; why: string }[];
  greenFlags: string[];
  questionsToAsk: string[];
  verifyWith: string[];
};

const VERDICT_UI: Record<Verdict, { label: string; className: string }> = {
  credible: {
    label: "[ ok ] specific & checkable",
    className: "border-ok/40 bg-ok/10 text-ok",
  },
  mixed: {
    label: "[ .. ] mixed — some claims need proof",
    className: "border-warn/50 bg-warn/10 text-warn",
  },
  vague: {
    label: "[ !! ] vague — possible greenwashing",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  insufficient: {
    label: "[ ?? ] not enough to judge",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const EXAMPLES = [
  {
    label: "vague",
    claim:
      "Our eco-friendly collection is made with love for the planet. Choose conscious fashion and join the green movement!",
  },
  {
    label: "specific",
    claim:
      "This T-shirt is made from 100% GOTS-certified organic cotton (certificate no. published on our site). Our 2024 supplier list is public, and we repair any garment free of charge for 5 years.",
  },
];

function FlagList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-ok">›</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GreenwashCheck() {
  const check = useAction(api.greenwash.check);
  const [brand, setBrand] = useState("");
  const [claim, setClaim] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async () => {
    if (pending) return;
    if (claim.trim().length < 15) {
      toast.error("Paste the brand's claim first (at least a sentence).");
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const r = await check({
        claim,
        brand: brand.trim() || undefined,
      });
      setResult(r);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Check failed. Try again.",
      );
    } finally {
      setPending(false);
    }
  };

  const ui = result ? VERDICT_UI[result.verdict] : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> ./greenwash-check --claim
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Greenwash checker
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste a sustainability claim from a brand&apos;s site, tag or ad. The
          AI reads the wording for common greenwashing patterns. It can&apos;t
          look the brand up, so treat the result as a prompt for questions, not
          a certification.
        </p>
      </div>

      <TermWindow title="input --claim">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="brand">
              brand (optional)
            </label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. the brand you're looking at"
              maxLength={100}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="claim">
              the claim (copy-paste the exact words)
            </label>
            <Textarea
              id="claim"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g. “Our eco-friendly collection is made with love for the planet…”"
              rows={5}
              maxLength={2500}
              className="mt-1"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={run}
              disabled={pending}
              className="cursor-pointer font-semibold"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ScanSearch className="size-4" />
              )}
              {pending ? "analysing…" : "check this claim"}
            </Button>
            <span className="text-xs text-muted-foreground">try an example:</span>
            {EXAMPLES.map((ex) => (
              <Button
                key={ex.label}
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  setClaim(ex.claim);
                  setResult(null);
                }}
              >
                {ex.label}
              </Button>
            ))}
          </div>
        </div>
      </TermWindow>

      {result && ui && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <TermWindow title="output --analysis">
            <div className="flex flex-col gap-5">
              <span
                className={`inline-block w-fit rounded-sm border px-2.5 py-1 text-xs font-semibold ${ui.className}`}
              >
                {ui.label}
              </span>
              {result.summary && (
                <p className="text-sm leading-relaxed">{result.summary}</p>
              )}

              {result.redFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    red flags
                  </p>
                  <ul className="mt-2 space-y-3">
                    {result.redFlags.map((f, i) => (
                      <li
                        key={i}
                        className="rounded-sm border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm leading-relaxed"
                      >
                        <p className="font-semibold">{f.pattern}</p>
                        {f.quote && (
                          <p className="mt-0.5 text-xs italic text-muted-foreground">
                            “{f.quote}”
                          </p>
                        )}
                        <p className="mt-1">{f.why}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <FlagList title="what looks solid" items={result.greenFlags} />
              <FlagList
                title="questions to ask the brand"
                items={result.questionsToAsk}
              />
              <FlagList
                title="verify independently"
                items={result.verifyWith}
              />
            </div>
          </TermWindow>
        </motion.div>
      )}
    </div>
  );
}
