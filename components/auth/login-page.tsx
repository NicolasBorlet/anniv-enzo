"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

function isSafeRedirect(path: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { signIn, isSuperAdmin, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!authLoading && isSuperAdmin) {
      router.replace(isSafeRedirect(redirectTo) ? redirectTo : "/photos");
    }
  }, [authLoading, isSuperAdmin, redirectTo, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
      router.replace(isSafeRedirect(redirectTo) ? redirectTo : "/photos");
    } catch {
      setError("Identifiants invalides ou compte non autorisé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isSuperAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-primary icon-glow"
          aria-label="Chargement"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6"
      >
        <Link
          href="/"
          className="mb-8 inline-flex h-10 w-10 cursor-pointer items-center justify-center self-start rounded-full text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>

        <div className="glass-card relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <Sparkles
            className="absolute right-4 top-4 h-5 w-5 text-accent/50 icon-glow motion-safe:animate-sparkle"
            aria-hidden="true"
          />
          <Sparkles
            className="absolute bottom-6 left-4 h-4 w-4 text-secondary/40 motion-safe:animate-sparkle motion-safe:[animation-delay:1.5s]"
            aria-hidden="true"
          />
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted shadow-[0_0_16px_var(--glow-primary)] motion-safe:animate-glow-pulse">
              <Lock className="h-5 w-5 text-primary icon-glow" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-magic-gradient">
                Administration
              </h1>
              <p className="text-sm text-muted-foreground">
                Connexion réservée aux super admins.
              </p>
            </div>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-magic flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Se connecter
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
