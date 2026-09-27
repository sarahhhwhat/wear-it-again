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
import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  PackageOpen,
  Search,
  Shuffle,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const CATEGORIES = [
  "all",
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
] as const;

const SIZES = ["XS", "S", "M", "L", "XL", "one-size"] as const;

/** Downscale an image file to a small JPEG data URL so it fits in the DB. */
async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 720;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SwapBoard() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"available" | "all" | "claimed">(
    "available",
  );

  // debounce search so we don't re-query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const items = useQuery(api.swapItems.list, {
    q: debouncedQ || undefined,
    category,
    claimedFilter: status,
    includeMine: true,
  });

  const post = useMutation(api.swapItems.post);
  const claim = useMutation(api.swapItems.claim);

  const [title, setTitle] = useState("");
  const [categoryNew, setCategoryNew] = useState("tops");
  const [sizeNew, setSizeNew] = useState("M");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file (jpg, png, webp…).");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setImageDataUrl(dataUrl);
    } catch {
      toast.error("Couldn't read that image — try a different file.");
    }
  };

  const handlePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !contact.trim()) {
      toast.error("Title and contact are required.");
      return;
    }
    setSubmitting(true);
    try {
      await post({
        title,
        category: categoryNew,
        size: sizeNew,
        contact,
        description: description || undefined,
        priceCents:
          price.trim() && !isNaN(parseFloat(price))
            ? Math.round(parseFloat(price) * 100)
            : undefined,
        imageDataUrl: imageDataUrl ?? undefined,
      });
      setTitle("");
      setContact("");
      setDescription("");
      setPrice("");
      setImageDataUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Listed! It's live on the board.");
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
      toast.success("Claimed! Reach out to arrange the handover.");
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> ./swap-board --catalog
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Swap Board</h1>
        <p className="text-sm text-muted-foreground">
          Give clothes a second life — post yours, claim someone else's, or buy
          it outright.
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
                  value={categoryNew}
                  onValueChange={setCategoryNew}
                  disabled={submitting}
                >
                  <SelectTrigger id="category" className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "all").map((c) => (
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
                <Select
                  value={sizeNew}
                  onValueChange={setSizeNew}
                  disabled={submitting}
                >
                  <SelectTrigger id="size" className="mt-1.5 w-full">
                    <SelectValue />
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
                placeholder="email / @handle / dorm + room"
                maxLength={120}
                disabled={submitting}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                Description <span className="normal-case">(optional)</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Condition, fit, why you're passing it on…"
                maxLength={1000}
                rows={3}
                disabled={submitting}
                className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <Label
                htmlFor="price"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                Price <span className="normal-case">(optional, USD)</span>
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="leave empty for a free swap"
                disabled={submitting}
                className="mt-1.5"
                inputMode="decimal"
              />
            </div>

            <div>
              <Label
                htmlFor="photo"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                Photo <span className="normal-case">(optional)</span>
              </Label>
              {imageDataUrl ? (
                <div className="relative mt-1.5">
                  <img
                    src={imageDataUrl}
                    alt="Listing preview"
                    className="h-32 w-full rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="absolute right-2 top-2 rounded-sm bg-background/80 p-1 text-foreground hover:bg-background"
                    aria-label="Remove photo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={submitting}
                  className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-input px-3 py-4 text-xs text-muted-foreground transition-colors hover:border-ok/50 hover:text-foreground"
                >
                  <ImagePlus className="size-4" /> add a photo
                </button>
              )}
              <input
                ref={fileRef}
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePickImage}
                className="hidden"
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
                  <Shuffle className="size-4" /> $ list it
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your contact info is visible to anyone on the board.
            </p>
          </form>
        </TermWindow>

        {/* catalog */}
        <div className="min-w-0 space-y-4">
          {/* search + filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="search the rack… (title, description, category)"
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">available</SelectItem>
                <SelectItem value="claimed">claimed</SelectItem>
                <SelectItem value="all">all</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {items === undefined ? (
            <TermWindow title="catalog --loading">
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> digging through the
                rack…
              </div>
            </TermWindow>
          ) : items.length === 0 ? (
            <TermWindow title="catalog --empty">
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <PackageOpen className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {q || category !== "all"
                    ? "Nothing matches that search. Try fewer words or another category."
                    : "The rack is empty. Post the first item!"}
                </p>
              </div>
            </TermWindow>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((it) => (
                <Link
                  key={it._id}
                  to={`/swap-board/${it._id}`}
                  className="group overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-md"
                >
                  <div className="relative h-36 bg-muted">
                    {it.hasImage ? (
                      <ItemThumb id={it._id} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-muted-foreground/40">
                        ♻
                      </div>
                    )}
                    {it.claimed && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-ok px-2 py-0.5 text-xs font-semibold text-ok-foreground">
                        <CheckCircle2 className="size-3" /> claimed
                      </span>
                    )}
                    {it.isMine && (
                      <span className="absolute right-2 top-2 rounded-sm bg-warn px-2 py-0.5 text-xs font-semibold text-warn-foreground">
                        yours
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold group-hover:text-ok">
                      {it.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {it.category} · {it.size}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${it.priceCents != null ? "text-foreground" : "text-ok"}`}
                      >
                        {it.priceCents != null
                          ? money(it.priceCents)
                          : "free swap"}
                      </span>
                      {!it.claimed && !it.isMine && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClaim(it._id);
                          }}
                          disabled={busyId === it._id}
                        >
                          {busyId === it._id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "quick claim"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Renders the stored photo for a listing card. */
function ItemThumb({ id }: { id: string }) {
  const detail = useQuery(api.swapItems.getById, { id: id as never });
  if (detail?.imageDataUrl) {
    return (
      <img
        src={detail.imageDataUrl}
        alt=""
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full items-center justify-center text-2xl text-muted-foreground/40">
      ♻
    </div>
  );
}
