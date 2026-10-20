import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

type Mode = "signIn" | "signUp";

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect, { replace: true });
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const flow = mode === "signUp" ? "signUp" : "signIn";
      await signIn("password", {
        email,
        password,
        ...(mode === "signUp" ? { name } : {}),
        flow,
      });
      navigate(redirect, { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const cleaned = raw
        .replace(/^\[CONVEX [^\]]+\]\s*/, "")
        .replace(/^\[Request ID: [^\]]+\]\s*/, "")
        .replace(/^Uncaught Error: /, "")
        .replace(/^Error: /, "");
      // Convex hides plain server-side errors behind "Server Error", which
      // tells the user nothing. In practice both real causes are credential
      // mismatches: the email is already registered (sign-up), or there is no
      // account for that email / the password is wrong (sign-in).
      const message = /Server Error|Called by client/.test(cleaned)
        ? mode === "signUp"
          ? "could not create the account — that email may already be registered here. Try logging in instead."
          : "could not log in — check the email and password, or switch to sign up if this is a new email."
        : cleaned || "Something went wrong. Try again.";
      setError(message.slice(0, 200));
      setIsLoading(false);
    }
  };

  const friendly =
    mode === "signIn"
      ? "Good to see you again. Log in and pick up your streak."
      : "Create a free account to list clothes, claim new favourites, and start logging your impact.";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_1fr]">
        <div className="hidden md:block">
          <Link to="/" aria-label="Back to home">
            <BrandMark />
          </Link>
          <h1 className="mt-10 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-balance">
            {mode === "signUp"
              ? "Give your clothes another life."
              : "Good to see you again."}
          </h1>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted-foreground">
            {friendly}
          </p>
        </div>

        <div className="w-full">
          <Link to="/" className="mb-6 block md:hidden" aria-label="Back to home">
            <BrandMark />
          </Link>
          <div className="stitch rounded-3xl border border-border bg-card p-7 shadow-[0_18px_40px_-22px_rgba(21,29,59,0.35)] sm:p-9">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {mode === "signUp" ? "Create your account" : "Log in"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground md:hidden">
              {friendly}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signUp" && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  required
                  className="h-11"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                  disabled={isLoading}
                  required
                  minLength={8}
                  className="h-11"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {mode === "signUp" ? "Creating account" : "Logging in"}
                  </>
                ) : mode === "signUp" ? (
                  "Create account"
                ) : (
                  "Log in"
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-4 text-center text-sm">
              {mode === "signIn" ? (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => {
                    setMode("signUp");
                    setError(null);
                  }}
                >
                  New here? Create an account
                </button>
              ) : (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => {
                    setMode("signIn");
                    setError(null);
                  }}
                >
                  Already have an account? Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <Auth {...props} />
    </Suspense>
  );
}
