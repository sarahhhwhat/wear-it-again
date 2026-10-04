"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// Greenwash Checker: the user pastes a sustainability claim (from a brand
// website, product tag or ad). The model analyses the *wording* of the claim
// against well-known greenwashing patterns. It does NOT browse the web or
// verify the brand, so the prompt forbids it from asserting facts about a
// brand that were not in the pasted text.

const SYSTEM_PROMPT = `You are a greenwashing analyst for the "Wear It Again" sustainable-fashion app.
You are given a sustainability claim a shopper copied from a brand (website, tag, ad), and optionally the brand name and product type.

Analyse ONLY the wording of the claim. You cannot browse the web and you do not know this brand's real practices, so never state facts about the brand that are not in the pasted text.

Check the claim against common greenwashing patterns, for example:
- vague terms with no definition ("eco-friendly", "conscious", "green", "planet-friendly", "natural")
- no numbers, no baseline, no time frame ("reduced emissions" - by how much, versus what, by when?)
- offsets or future pledges presented as present achievements ("carbon neutral", "net zero by 2050")
- a single small attribute highlighted while the main impact is ignored (e.g. one recycled-polyester line while the rest is virgin synthetic)
- self-made labels or badges instead of independent third-party certification
- irrelevant or always-true claims ("CFC-free")
- hidden trade-offs (e.g. "recycled" without saying how much, or "organic" for only part of the product)
Also note genuine strengths: specific figures with a baseline, named independent certifications, supply-chain transparency, repair/take-back programmes.

Independent certifications you may suggest the shopper look for (only suggest these; do not invent others): GOTS, OEKO-TEX, Fair Trade Certified, Bluesign, B Corp, Global Recycled Standard (GRS), Responsible Wool Standard (RWS), Cradle to Cradle. Tell the shopper to verify any certification in the certifier's own public database.

Verdict rules:
- "credible": specific, measurable, independently verifiable claims
- "mixed": some specific or verifiable parts, but also vague or unsupported parts
- "vague": mostly vague, unmeasurable or self-declared
- "insufficient": the text is too short or not a sustainability claim

Respond with a single JSON object and nothing else, with exactly these keys:
{
  "verdict": "credible" | "mixed" | "vague" | "insufficient",
  "summary": "2-3 plain-language sentences",
  "red_flags": [{ "pattern": "short name", "quote": "exact words from the claim, or empty string", "why": "one sentence" }],
  "green_flags": ["short strings"],
  "questions_to_ask": ["questions the shopper can ask the brand"],
  "verify_with": ["certifications or documents to look for and verify independently"]
}
Keep every list to at most 4 items. Be fair: do not call a claim vague if it is specific.`;

const MODELS = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter((m): m is string => typeof m === "string" && m.length > 0);

const VERDICTS = ["credible", "mixed", "vague", "insufficient"] as const;

const strList = (x: unknown, max = 4): string[] =>
  Array.isArray(x)
    ? x
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .map((s) => s.trim().slice(0, 300))
        .slice(0, max)
    : [];

function parseResult(raw: string) {
  // Models sometimes wrap JSON in prose or fences: take the outermost {...}.
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object");
  const obj = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;

  const verdict = VERDICTS.includes(obj.verdict as (typeof VERDICTS)[number])
    ? (obj.verdict as (typeof VERDICTS)[number])
    : "insufficient";

  const redFlags = Array.isArray(obj.red_flags)
    ? obj.red_flags
        .map((f) => {
          const o = (f ?? {}) as Record<string, unknown>;
          return {
            pattern: typeof o.pattern === "string" ? o.pattern.trim().slice(0, 120) : "",
            quote: typeof o.quote === "string" ? o.quote.trim().slice(0, 300) : "",
            why: typeof o.why === "string" ? o.why.trim().slice(0, 400) : "",
          };
        })
        .filter((f) => f.pattern || f.why)
        .slice(0, 4)
    : [];

  return {
    verdict,
    summary: typeof obj.summary === "string" ? obj.summary.trim().slice(0, 700) : "",
    redFlags,
    greenFlags: strList(obj.green_flags),
    questionsToAsk: strList(obj.questions_to_ask),
    verifyWith: strList(obj.verify_with),
  };
}

export const check = action({
  args: {
    claim: v.string(),
    brand: v.optional(v.string()),
    product: v.optional(v.string()),
  },
  handler: async (_ctx, { claim, brand, product }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not configured on the server. Add it in the project's environment settings.",
      );
    }

    const cleanClaim = claim.trim().slice(0, 2500);
    if (cleanClaim.length < 15) {
      throw new Error("Paste a bit more of the brand's claim (at least a sentence).");
    }
    const userContent = [
      brand?.trim() ? `Brand: ${brand.trim().slice(0, 100)}` : null,
      product?.trim() ? `Product: ${product.trim().slice(0, 100)}` : null,
      `Claim text:\n"""\n${cleanClaim}\n"""`,
    ]
      .filter(Boolean)
      .join("\n");

    let lastError: unknown = null;
    for (const model of MODELS) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userContent },
            ],
            temperature: 0.2,
            max_tokens: 900,
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          lastError = new Error(`Groq API error (${res.status}): ${body.slice(0, 300)}`);
          if (res.status === 429) {
            throw new Error(
              "Groq rate limit or quota reached (429). Wait a moment and try again.",
            );
          }
          if (res.status === 401 || res.status === 403) {
            throw new Error(
              "Groq rejected the API key (401/403). Check GROQ_API_KEY on the server.",
            );
          }
          continue; // bad model id etc. -> try next candidate
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (!text) {
          lastError = new Error("Empty response from model.");
          continue;
        }
        try {
          return { ...parseResult(text), model };
        } catch {
          lastError = new Error("Model returned an unreadable answer.");
          continue;
        }
      } catch (err) {
        lastError = err;
        if (err instanceof Error && /429|401\/403/.test(err.message)) throw err;
      }
    }

    throw new Error(
      lastError instanceof Error
        ? `AI request failed: ${lastError.message}`
        : "AI request failed.",
    );
  },
});
