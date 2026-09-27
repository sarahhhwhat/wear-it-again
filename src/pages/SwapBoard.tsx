import { TermWindow } from "@/components/TermWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Loader2,
  PackageOpen,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
] as const;

const SIZES = ["XS", "S", "M", "L", "XL", "one-size"] as const;

export default function SwapBoard() {
  const { user } = useAuth();
  const items = useQuery(api.swapItems.list);
  const mine = useQuery(api.swapItems.mine);
  const post = useMutation(api.swapItems.post);
  const claim = useMutation(api.swapItems.claim);
  const unclaim = useMutation(api.swapItems.unclaim);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("tops");
  const [size, setSize] = useState<string>("M");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const itemsWithMine = (items ?? []).map((it) => ({
    ...it,
    isMine: mine?.some((m) => m._id === it._id) ?? false,
  }));

  const available = itemsWithMine.filter((it) => !it.claimed);
  const claimed = itemsWithMine.filter((it) => it.claimed);

  const handlePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !contact.trim()) {
      toast.error("Title and contact are required.");
      return;
    }
    setSubmitting(true);
    try {
      await post({ title, category, size, contact });
      setTitle("");
      setContact("");
      toast.success("Item posted to the board.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Failed to post item.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (id: string) => {
    setBusyId(id);
    try {
      await claim({ id: id as never });
      toast.success("Claimed! Reach out to the poster to collect it.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Failed to claim.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleUnclaim = async (id: string) => {
    setBusyId(id);
    try {
      await unclaim({ id: id as never });
      toast.success("Un-claimed. The item is back on the board.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Failed to un-claim.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> ./swap-board --list
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Swap Board</h1>
        <p className="text-sm text-muted-foreground">
          Post clothes you no longer wear. Claim what you'll actually wear again.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* post form */}
        <TermWindow title="swap --post" bodyClassName="p-4 sm:p-5">
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <Label
                htmlFor="title"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vintage denim jacket"
                maxLength={120}
                disabled={submitting}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="category"
                  className="text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={submitting}
                >
                  <SelectTrigger id="category" className="mt-1.5 w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="size"
                  className="text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Size
                </Label>
                <Select value={size} onValueChange={setSize} disabled={submitting}>
                  <SelectTrigger id="size" className="mt-1.5 w-full">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor="contact"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                Contact
              </Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="@insta / email / dorm+room"
                maxLength={120}
                disabled={submitting}
                className="mt-1.5"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> posting…
                </>
              ) : (
                <>
                  <Shuffle className="size-4" /> $ post to board
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Contact info is visible to anyone browsing the board.
            </p>
          </form>
        </TermWindow>

        {/* board */}
        <div className="min-w-0 space-y-6">
          <TermWindow
            title={`board --available (${available.length})`}
            bodyClassName="p-3 sm:p-4"
          >
            {items === undefined ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> loading board…
              </div>
            ) : available.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <PackageOpen className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Board is empty. Post the first item!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {available.map((it) => (
                  <li
                    key={it._id}
                    className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{it.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {it.category} · size {it.size} · by{" "}
                        <span className="text-foreground/80">
                          {it.isMine
                            ? "you"
                            : it.posterName || it.posterEmail || "student"}
                        </span>
                        {it.isMine ? ` · contact: ${it.contact}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!it.isMine && (
                        <>
                          <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:block">
                            {it.contact}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleClaim(it._id)}
                            disabled={busyId === it._id}
                          >
                            {busyId === it._id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              "claim"
                            )}
                          </Button>
                        </>
                      )}
                      {it.isMine && (
                        <span className="rounded-sm bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
                          your listing
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TermWindow>

          <TermWindow
            title={`board --claimed (${claimed.length})`}
            bodyClassName="p-3 sm:p-4"
          >
            {claimed.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Nothing claimed yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {claimed.map((it) => (
                  <li
                    key={it._id}
                    className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0 opacity-70">
                      <p className="truncate text-sm font-semibold line-through decoration-warn/60">
                        {it.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {it.category} · size {it.size} · by{" "}
                        {it.isMine
                          ? "you"
                          : it.posterName || it.posterEmail || "student"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-sm bg-ok/15 px-2 py-0.5 text-xs font-semibold text-ok">
                        <CheckCircle2 className="size-3" /> claimed
                      </span>
                      {it.isMine && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnclaim(it._id)}
                          disabled={busyId === it._id}
                        >
                          <RotateCcw className="size-3.5" /> unclaim
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TermWindow>
        </div>
      </div>
    </div>
  );
}
