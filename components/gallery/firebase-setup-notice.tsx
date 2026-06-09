import { AlertCircle, ExternalLink } from "lucide-react";

export function FirebaseSetupNotice() {
  return (
    <div
      role="alert"
      className="glass-card rounded-2xl border-accent/40 p-6 text-foreground"
    >
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">Configuration Firebase requise</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Copiez{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">
              .env.local.example
            </code>{" "}
            vers{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">
              .env.local
            </code>{" "}
            et renseignez vos clés Firebase. Consultez le README pour les règles
            de Storage.
          </p>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ouvrir la console Firebase
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
