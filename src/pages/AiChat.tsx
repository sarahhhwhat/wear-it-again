import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Is this brand actually sustainable? How can I tell?",
  "How do I wash clothes so they last longer?",
  "What certifications should I look for?",
  "Best way to repair a holey sweater?",
];

export default function AiChat() {
  const ask = useAction(api.ai.ask);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Ask me anything about sustainable fashion — brands, materials, repair, or your rewearing streak. I'm here to help you wear it again.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || pending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setPending(true);
    try {
      const history = messages
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));
      const { answer } = await ask({ question, history });
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "AI request failed.",
      );
      const detail =
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠ Chat is unavailable right now. ${detail}`,
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const reset = () =>
    setMessages([
      {
        role: "assistant",
        content:
          "Ask me anything about sustainable fashion — brands, materials, repair, or your rewearing streak. I'm here to help you wear it again.",
      },
    ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ask about sustainable fashion"
        description="Answers come from an AI model grounded in sustainable-fashion knowledge. Verify brand claims before you buy."
      />

      <Panel className="flex flex-col" bodyClassName="p-0 flex flex-col">
        <div
          ref={scrollRef}
          className="soft-scroll max-h-[55vh] min-h-[320px] flex-1 overflow-y-auto p-5"
        >
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 leading-relaxed text-primary-foreground"
                      : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 leading-relaxed"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Thinking
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* suggestions (only when only greeting present) */}
        {messages.length <= 1 && !pending && (
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-stitch hover:bg-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-border bg-muted/40 p-3 sm:px-4"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Is cotton or polyester worse?"
            disabled={pending}
            className="h-11 flex-1 bg-card"
            maxLength={1000}
          />
          <Button
            type="submit"
            size="icon"
            className="size-11"
            disabled={pending || !input.trim()}
            aria-label="Send"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            onClick={reset}
            aria-label="Start a new chat"
          >
            <Trash2 className="size-4" />
          </Button>
        </form>
      </Panel>

      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-stitch" />
        Powered by Groq. Answers are AI-generated, so double-check anything important.
      </p>
    </div>
  );
}
