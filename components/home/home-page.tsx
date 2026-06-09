import Link from "next/link";
import { Camera, Crown, Images, Sparkles, Wand2 } from "lucide-react";

const choices = [
  {
    href: "/photos",
    icon: Images,
    title: "Voir les photos",
    description: "Parcourez les souvenirs enchantés de la soirée",
    glow: "group-hover:shadow-[0_0_20px_var(--glow-primary)]",
  },
  {
    href: "/upload",
    icon: Camera,
    title: "Partager une photo",
    description: "Ajoutez votre touche de magie à l'album",
    glow: "group-hover:shadow-[0_0_20px_var(--glow-gold)]",
  },
] as const;

export function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="relative text-center">
          <Sparkles
            className="absolute -left-2 top-0 h-5 w-5 text-accent icon-glow motion-safe:animate-sparkle sm:-left-8 sm:h-7 sm:w-7"
            aria-hidden="true"
          />
          <Sparkles
            className="absolute -right-2 top-2 h-4 w-4 text-secondary icon-glow motion-safe:animate-sparkle motion-safe:[animation-delay:1.2s] sm:-right-8 sm:h-6 sm:w-6"
            aria-hidden="true"
          />
          <Sparkles
            className="absolute left-1/4 top-16 h-3 w-3 text-accent-soft motion-safe:animate-sparkle motion-safe:[animation-delay:2.4s] sm:h-4 sm:w-4"
            aria-hidden="true"
          />
          <Sparkles
            className="absolute right-1/4 top-20 h-3 w-3 text-accent motion-safe:animate-sparkle motion-safe:[animation-delay:0.6s] sm:h-4 sm:w-4"
            aria-hidden="true"
          />

          <Crown
            className="mx-auto mb-2 h-8 w-8 text-accent icon-glow motion-safe:animate-crown-bob"
            aria-hidden="true"
          />
          <Wand2
            className="mx-auto mb-3 h-7 w-7 text-primary icon-glow motion-safe:animate-sparkle motion-safe:[animation-delay:0.75s]"
            aria-hidden="true"
          />
          <p className="font-accent text-4xl text-secondary sm:text-5xl">
            Un royaume enchanté
          </p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight text-magic-gradient sm:text-7xl">
            Anniv Enzo
          </h1>
          <p className="mx-auto mt-5 max-w-md text-xl text-muted-foreground">
            Revivez la fête féerique — consultez les photos ou partagez les vôtres.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 sm:gap-7">
          {choices.map(({ href, icon: Icon, title, description, glow }) => (
            <Link
              key={href}
              href={href}
              className="glass-card group flex cursor-pointer flex-col items-start gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0 sm:p-8"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary ${glow}`}
              >
                <Icon className="h-6 w-6 motion-safe:group-hover:animate-sparkle" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                  {title}
                </h2>
                <p className="mt-1.5 text-base text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
