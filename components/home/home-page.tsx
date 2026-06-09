import Link from "next/link";
import { Camera, Images, Sparkles } from "lucide-react";

const choices = [
  {
    href: "/photos",
    icon: Images,
    title: "Voir les photos",
    description: "Parcourez les souvenirs féeriques de la soirée",
  },
  {
    href: "/upload",
    icon: Camera,
    title: "Partager une photo",
    description: "Partagez vos clichés magiques de la fête",
  },
] as const;

export function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Fées • Licorne • Princesse • Magie
          </div>
          <h1 className="font-heading text-5xl tracking-wide text-foreground sm:text-6xl">
            Anniv Enzo féérique
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Entrez dans un univers de princesse et de licorne pour revivre la soirée.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {choices.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-border bg-surface/95 p-6 shadow-[0_10px_30px_rgba(168,85,247,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/35 hover:shadow-[0_16px_36px_rgba(244,114,182,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors duration-200 group-hover:bg-primary group-hover:text-on-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
