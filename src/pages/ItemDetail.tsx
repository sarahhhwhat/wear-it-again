import { Panel } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  Droplets,
  Loader2,
  Mail,
  Send,
  Shirt,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const WATER_PER_GARMENT_L = 2700;
const CO2_PER_GARMENT_KG = 8;

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const item = useQuery(
    api.swapItems.getById,
    id ? { id: id as never } : "skip",
  );
  const comments = useQuery(
    api.comments.list,
    id ? { itemId: id as never } : "skip",
  );

  const claim = useMutation(api.swapItems.claim);
  const unclaim = useMutation(api.swapItems.unclaim);
  const createOrder = useMutation(api.orders.createPending);
  const markPaid = useMutation(api.orders.markPaid);
  const addComment = useMutation(api.comments.add);

  const [busy, setBusy] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  if (item === undefined) {
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading item
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">
          This listing no longer exists. It may have been removed.
        </p>
        <Button variant="outline" asChild>
          <Link to="/swap-board">
            <ArrowLeft className="size-4" /> Back to the swap board
          </Link>
        </Button>
      </div>
    );
  }

  const handleClaim = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await claim({ id: id as never });
      toast.success("Claimed! Message the seller below to arrange pickup.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Failed to claim.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUnclaim = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await unclaim({ id: id as never });
      toast.success("Back on the board.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Failed to un-claim.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBuy = async () => {
    if (!id || item.priceCents == null) return;
    setBusy(true);
    try {
      const { orderId } = await createOrder({ itemId: id as never });
      // Simulated secure checkout until live payment keys are connected.
      // With STRIPE_SECRET_KEY set, this is where the Stripe session kicks off.
      await markPaid({ orderId });
      toast.success("Paid! The seller has been notified.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Checkout failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    setPosting(true);
    try {
      await addComment({ itemId: id as never, body: commentText });
      setCommentText("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Failed to comment.",
      );
    } finally {
      setPosting(false);
    }
  };

  const row = "flex items-baseline justify-between gap-4";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {item.title}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* left: photo + description + comments */}
        <div className="min-w-0 space-y-6">
          <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
            {item.imageDataUrl ? (
              <img
                src={item.imageDataUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Shirt className="size-16 text-muted-foreground/30" />
            )}
          </div>

          {item.description && (
            <Panel title="About this piece">
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Panel>
          )}

          <Panel title="Why it matters">
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Droplets className="size-5" />
              </span>
              <p className="leading-relaxed text-muted-foreground">
                Rewearing this instead of buying new saves roughly{" "}
                <span className="font-semibold text-foreground">
                  {WATER_PER_GARMENT_L.toLocaleString()} L of water
                </span>{" "}
                and{" "}
                <span className="font-semibold text-foreground">
                  {CO2_PER_GARMENT_KG} kg of CO₂
                </span>
                .{" "}
                <Link
                  to="/calculator"
                  className="font-medium text-primary hover:underline"
                >
                  Run your own numbers
                </Link>
              </p>
            </div>
          </Panel>

          <Panel
            title={`Comments (${comments?.length ?? 0})`}
            bodyClassName="p-0"
          >
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 p-5">
                {comments === undefined ? (
                  <p className="text-sm text-muted-foreground">
                    Loading comments
                  </p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No comments yet. Ask about the fit, the fabric, or when you
                    can pick it up.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex flex-col gap-1">
                      <p className="text-sm">
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          {timeAgo(c._creationTime)}
                        </span>
                      </p>
                      <p className="rounded-xl bg-muted/70 px-3.5 py-2.5 leading-relaxed">
                        {c.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <form
                onSubmit={handleComment}
                className="flex items-center gap-2 border-t border-border bg-muted/40 p-3 sm:px-4"
              >
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Write a comment as ${user?.name?.split(" ")[0] ?? "you"}`}
                  maxLength={500}
                  disabled={posting}
                  className="h-10 flex-1 bg-card"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-10"
                  disabled={posting || !commentText.trim()}
                  aria-label="Post comment"
                >
                  {posting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            </div>
          </Panel>
        </div>

        {/* right: buy panel */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Panel stitched bodyClassName="p-6">
            <div className="flex flex-col gap-4">
              <div className={row}>
                <span className="text-muted-foreground">Price</span>
                <span
                  className={`font-display text-3xl font-bold ${item.priceCents != null ? "" : "text-ok"}`}
                >
                  {item.priceCents != null ? money(item.priceCents) : "Free swap"}
                </span>
              </div>
              <div className={row}>
                <span className="text-muted-foreground">Status</span>
                {item.claimed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-0.5 text-sm font-semibold text-ok">
                    <CheckCircle2 className="size-3.5" /> Claimed
                  </span>
                ) : (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-semibold text-warn">
                    Available
                  </span>
                )}
              </div>
              <div className={row}>
                <span className="text-muted-foreground">Details</span>
                <span>
                  {item.category}, size {item.size}
                </span>
              </div>
              <div className={row}>
                <span className="text-muted-foreground">Listed</span>
                <span className="text-right">
                  {timeAgo(item.createdAt)} by{" "}
                  {item.isMine ? "you" : (item.sellerName ?? "a rewearer")}
                </span>
              </div>

              <div className="border-t border-border pt-4">
                {item.isMine ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      This is your listing.
                      {item.claimed
                        ? " Someone claimed it. Get in touch to hand it over."
                        : ""}
                    </p>
                    {item.claimed && (
                      <Button
                        variant="outline"
                        onClick={handleUnclaim}
                        disabled={busy}
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Put back on the board"
                        )}
                      </Button>
                    )}
                  </div>
                ) : item.claimed ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      Someone got here first. Keep an eye on the board, good
                      pieces move fast.
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/swap-board">Browse more</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {item.priceCents != null ? (
                      <>
                        <Button
                          className="h-11 text-base font-semibold"
                          onClick={handleBuy}
                          disabled={busy}
                        >
                          {busy ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="size-4" /> Buy for{" "}
                              {money(item.priceCents)}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleClaim}
                          disabled={busy}
                        >
                          Or claim it for free
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="h-11 text-base font-semibold"
                        onClick={handleClaim}
                        disabled={busy}
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Claim this item"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {!item.isMine && (
            <Panel title="Contact the seller">
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  <span className="break-all">{item.contact}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Say hi, agree on a spot, and give the piece its next life.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
