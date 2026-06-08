import Link from "next/link";
import { Camera, Images } from "lucide-react";

const choices = [
  {
    href: "/photos",
    icon: Images,
    title: "Voir les photos",
    description: "Parcourez les souvenirs publics de la soirée",
  },
  {
    href: "/upload",
    icon: Camera,
    title: "Partager une photo",
    description: "Envoyez vos propres clichés de la fête",
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
          <h1 className="font-heading text-5xl tracking-wide text-foreground sm:text-6xl">
            Anniv Enzo
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Revivez la soirée — consultez les photos ou partagez les vôtres.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {choices.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8"
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
