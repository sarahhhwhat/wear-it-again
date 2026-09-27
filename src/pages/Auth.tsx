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
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(
        message
          .replace(/^Uncaught Error: /, "")
          .replace(/^Error: /, "")
          .slice(0, 200),
      );
      setIsLoading(false);
    }
  };

  const friendly =
    mode === "signIn"
      ? "Good to see you again. Log in and pick up your streak."
      : "Create a free account to list clothes, claim new favourites, and start logging your impact.";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
            {/* terminal title bar */}
            <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-destructive/70" />
              <span className="size-2.5 rounded-full bg-warn/70" />
              <span className="size-2.5 rounded-full bg-ok/70" />                <span className="ml-2 text-xs text-muted-foreground">
                  wear-it-again — {mode === "signUp" ? "create account" : "log in"}
                </span>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs text-muted-foreground">
                <span className="text-ok">$</span> ./wear-it-again --auth
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                {mode === "signUp" ? "Sign up" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {friendly}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === "signUp" && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ada Lovelace"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground"
                  >
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
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      mode === "signUp" ? "new-password" : "current-password"
                    }
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                  {mode === "signUp" && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Minimum 8 characters. Secrets stay secret.
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    error: {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {mode === "signUp"
                        ? "Creating account..."
                        : "Logging in..."}
                    </>
                  ) : (
                    <span className="font-semibold">
                      {mode === "signUp" ? "$ sign up" : "$ log in"}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-4 text-center text-sm">
                {mode === "signIn" ? (
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setMode("signUp");
                      setError(null);
                    }}
                  >
                    No account yet? sign up
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setMode("signIn");
                      setError(null);
                    }}
                  >
                    Have an account? log in
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">
              ← back to home
            </Link>
          </p>
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
