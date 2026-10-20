import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
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
  Shirt,
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

  const labelCls = "text-sm font-medium";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Swap board"
        description="Give clothes a second life. Post yours, claim someone else's, or buy it outright."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* post form */}
        <Panel title="List a piece" className="lg:sticky lg:top-24">
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <Label htmlFor="title" className={labelCls}>
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vintage denim jacket"
                maxLength={120}
                disabled={submitting}
                className="mt-1.5 h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category" className={labelCls}>
                  Category
                </Label>
                <Select
                  value={categoryNew}
                  onValueChange={setCategoryNew}
                  disabled={submitting}
                >
                  <SelectTrigger id="category" className="mt-1.5 h-10 w-full">
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
                <Label htmlFor="size" className={labelCls}>
                  Size
                </Label>
                <Select
                  value={sizeNew}
                  onValueChange={setSizeNew}
                  disabled={submitting}
                >
                  <SelectTrigger id="size" className="mt-1.5 h-10 w-full">
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
              <Label htmlFor="contact" className={labelCls}>
                How can buyers reach you?
              </Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email, @handle or hostel + room"
                maxLength={120}
                disabled={submitting}
                className="mt-1.5 h-10"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Anyone on the board can see this.
              </p>
            </div>

            <div>
              <Label htmlFor="description" className={labelCls}>
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Condition, fit, why you're passing it on"
                maxLength={1000}
                rows={3}
                disabled={submitting}
                className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <Label htmlFor="price" className={labelCls}>
                Price in USD <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Leave empty for a free swap"
                disabled={submitting}
                className="mt-1.5 h-10"
                inputMode="decimal"
              />
            </div>

            <div>
              <Label htmlFor="photo" className={labelCls}>
                Photo <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              {imageDataUrl ? (
                <div className="relative mt-1.5">
                  <img
                    src={imageDataUrl}
                    alt="Listing preview"
                    className="h-36 w-full rounded-xl border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="absolute right-2 top-2 rounded-full bg-card/90 p-1.5 text-foreground shadow hover:bg-card"
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
                  className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stitch/70 px-3 py-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ImagePlus className="size-4" /> Add a photo
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
              className="h-11 w-full text-base font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Posting
                </>
              ) : (
                <>
                  <Shuffle className="size-4" /> List it
                </>
              )}
            </Button>
          </form>
        </Panel>

        {/* catalog */}
        <div className="min-w-0 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, description or category"
                className="h-10 bg-card pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 w-full bg-card sm:w-36">
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
              <SelectTrigger className="h-10 w-full bg-card sm:w-32">
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
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Looking through the rack
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stitch/60 bg-card p-10 text-center">
              <PackageOpen className="size-9 text-muted-foreground/60" />
              <p className="max-w-xs text-muted-foreground">
                {q || category !== "all"
                  ? "Nothing matches that search. Try fewer words or another category."
                  : "The rack is empty. Post the first item."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((it) => (
                <Link
                  key={it._id}
                  to={`/swap-board/${it._id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(21,29,59,0.4)]"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {it.hasImage ? (
                      <ItemThumb id={it._id} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/40">
                        <Shirt className="size-10" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 size-3.5 rounded-full border border-border bg-background shadow-inner" />
                    {it.claimed && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ok px-2.5 py-1 text-xs font-semibold text-ok-foreground">
                        <CheckCircle2 className="size-3" /> Claimed
                      </span>
                    )}
                    {it.isMine && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-stitch px-2.5 py-1 text-xs font-semibold text-foreground">
                        Yours
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="truncate font-display font-semibold group-hover:text-primary">
                      {it.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {it.category}, size {it.size}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-bold ${it.priceCents != null ? "" : "text-ok"}`}
                      >
                        {it.priceCents != null
                          ? money(it.priceCents)
                          : "Free swap"}
                      </span>
                      {!it.claimed && !it.isMine && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClaim(it._id);
                          }}
                          disabled={busyId === it._id}
                        >
                          {busyId === it._id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "Quick claim"
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
    <div className="flex h-full items-center justify-center text-muted-foreground/40">
      <Shirt className="size-10" />
    </div>
  );
}
