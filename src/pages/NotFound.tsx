import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <BrandMark />
      <div className="stitch w-full max-w-md rounded-3xl border border-border bg-card px-8 py-10">
        <p className="font-display text-7xl font-extrabold tabular-nums text-primary">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold">
          This page isn't in the wardrobe
        </h1>
        <p className="mt-2 text-muted-foreground">
          The link may be old or mistyped. Head back home and try again.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
