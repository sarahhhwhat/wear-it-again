"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

const SYSTEM_PROMPT = `You are the "Wear It Again" campus sustainable-fashion assistant.
You help students with practical, evidence-informed answers about sustainable fashion:
- whether brands are actually sustainable (be honest that claims vary; suggest checking certifications like GOTS, Fair Trade, B Corp, and transparency reports)
- clothing care, repair, and upcycling
- swapping, secondhand shopping, and rewearing habits
- the environmental footprint of clothing (e.g. a new cotton T-shirt ≈ 2,700 L water; garment industry ≈ 8-10% of global CO2 emissions)

Rules:
- Keep answers short and friendly: 2-5 sentences, or a short list when asked for options.
- Stay on topic: sustainable fashion, clothing care, swaps, repair, textiles. Politely redirect unrelated questions back to the campaign.
- Never invent certifications, statistics, or brand policies you are unsure of; say when the student should verify with the brand directly.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const MODELS = [
  process.env.GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter((m): m is string => typeof m === "string" && m.length > 0);

export const ask = action({
  args: {
    question: v.string(),
    history: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        }),
      ),
    ),
  },
  handler: async (_ctx, { question, history }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not configured on the server. Add it in the project's environment settings.",
      );
    }

    const cleanQuestion = question.trim().slice(0, 1000);
    if (!cleanQuestion) throw new Error("Please type a question first.");

    const recent = (history ?? [])
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0,
      )
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content.trim().slice(0, 1500),
      }));

    const messages: ChatMessage[] = [
      ...recent,
      { role: "user" as const, content: cleanQuestion },
    ];

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
              { role: "system" as const, content: SYSTEM_PROMPT },
              ...messages,
            ],
            temperature: 0.5,
            max_tokens: 600,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          lastError = new Error(
            `Groq API error (${res.status}): ${body.slice(0, 300)}`,
          );
          // A missing/invalid model is retryable with the next candidate;
          // auth problems are not.
          if (res.status === 401 || res.status === 403) throw lastError;
          continue;
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const answer = data.choices?.[0]?.message?.content?.trim();
        if (!answer) {
          lastError = new Error("Groq returned an empty response.");
          continue;
        }
        return { answer, model };
      } catch (err) {
        lastError = err;
        if (
          err instanceof Error &&
          /401|403/.test(err.message)
        ) {
          throw new Error(
            "Groq rejected the API key (401/403). Check GROQ_API_KEY on the server.",
          );
        }
      }
    }

    throw new Error(
      lastError instanceof Error
        ? `AI request failed: ${lastError.message}`
        : "AI request failed.",
    );
  },
});
