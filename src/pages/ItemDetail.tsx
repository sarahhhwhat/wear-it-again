import { TermWindow } from "@/components/TermWindow";
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
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> loading item…
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">
          This listing no longer exists — it may have been removed.
        </p>
        <Button variant="outline" asChild>
          <Link to="/swap-board">
            <ArrowLeft className="size-4" /> back to the swap board
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> cat ./swap-board/{item._id.slice(-6)}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* left: photo + description + comments */}
        <div className="min-w-0 space-y-6">
          <TermWindow title="item --photo" bodyClassName="p-3 sm:p-4">
            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              {item.imageDataUrl ? (
                <img
                  src={item.imageDataUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-6xl text-muted-foreground/30">♻</span>
              )}
            </div>
          </TermWindow>

          {item.description && (
            <TermWindow title="item --description">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </TermWindow>
          )}

          {/* impact snippet */}
          <TermWindow title="impact --this-item">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-border bg-ok/10 text-ok">
                <Droplets className="size-5" />
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
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
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Run your own numbers →
                </Link>
              </div>
            </div>
          </TermWindow>

          {/* comments */}
          <TermWindow
            title={`comments (${comments?.length ?? 0})`}
            bodyClassName="p-0 sm:p-0"
          >
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 p-4 sm:p-5">
                {comments === undefined ? (
                  <p className="text-sm text-muted-foreground">
                    loading comments…
                  </p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No comments yet. Ask about the fit, the fabric, or when you
                    can pick it up.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex flex-col gap-1">
                      <p className="text-xs">
                        <span className="font-semibold text-ok">
                          {c.name}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {timeAgo(c._creationTime)}
                        </span>
                      </p>
                      <p className="rounded-sm border border-border bg-muted/50 px-3 py-2 text-sm leading-relaxed">
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
                <span className="hidden text-sm text-ok sm:block">
                  {user?.name?.split(" ")[0] ?? "you"}@board:~$
                </span>
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="write a comment…"
                  maxLength={500}
                  disabled={posting}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
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
          </TermWindow>
        </div>

        {/* right: buy panel */}
        <div className="space-y-6">
          <TermWindow title="item --actions">
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">status</span>
                {item.claimed ? (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-ok/15 px-2 py-0.5 text-xs font-semibold text-ok">
                    <CheckCircle2 className="size-3" /> claimed
                  </span>
                ) : (
                  <span className="rounded-sm bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
                    available
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">price</span>
                <span
                  className={`text-lg font-bold ${item.priceCents != null ? "" : "text-ok"}`}
                >
                  {item.priceCents != null ? money(item.priceCents) : "free swap"}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">details</span>
                <span className="text-sm">
                  {item.category} · size {item.size}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">listed</span>
                <span className="text-sm">
                  {timeAgo(item.createdAt)} by{" "}
                  {item.isMine ? "you" : (item.sellerName ?? "a rewearer")}
                </span>
              </div>

              <div className="border-t border-border pt-4">
                {item.isMine ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                      This is your listing.{item.claimed ? " Someone claimed it — get in touch to hand it over." : ""}
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
                          "put back on the board"
                        )}
                      </Button>
                    )}
                  </div>
                ) : item.claimed ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                      Someone got here first. Keep an eye on the board — good
                      pieces move fast.
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/swap-board">browse more</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {item.priceCents != null ? (
                      <>
                        <Button
                          className="font-semibold"
                          onClick={handleBuy}
                          disabled={busy}
                        >
                          {busy ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="size-4" /> buy for{" "}
                              {money(item.priceCents)}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleClaim}
                          disabled={busy}
                        >
                          or claim for free
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="font-semibold"
                        onClick={handleClaim}
                        disabled={busy}
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "claim this item"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TermWindow>

          {!item.isMine && (
            <TermWindow title="item --seller">
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  contact the seller
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-ok" />
                  <span className="break-all">{item.contact}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Say hi, agree on a spot, and give the piece its next life.
                </p>
              </div>
            </TermWindow>
          )}
        </div>
      </div>
    </div>
  );
}
