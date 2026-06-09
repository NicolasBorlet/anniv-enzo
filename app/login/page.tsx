import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2
        className="h-8 w-8 animate-spin text-muted-foreground"
        aria-label="Chargement"
      />
    </div>
  );
}

export default function LoginRoute() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  );
}
