"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Images, RefreshCw, Sparkles } from "lucide-react";
import { EasterEggListener } from "@/components/easter-egg/easter-egg-listener";
import { FirebaseSetupNotice } from "@/components/gallery/firebase-setup-notice";
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton";
import { ImageGrid } from "@/components/gallery/image-grid";
import { UploadZone } from "@/components/gallery/upload-zone";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { listImages, uploadImage } from "@/lib/firebase/storage";
import type { GalleryConfig, GalleryImage } from "@/lib/types";

type GalleryPageProps = {
  config: GalleryConfig;
  showEasterEgg?: boolean;
  backHref?: string;
};

export function GalleryPage({
  config,
  showEasterEgg = false,
  backHref,
}: GalleryPageProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const configured = isFirebaseConfigured();

  const loadImages = useCallback(async () => {
    if (!configured) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await listImages(config.folder);
      setImages(result);
    } catch {
      setError("Impossible de charger les photos. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [configured, config.folder]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadImages();
  };

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      const uploaded = await uploadImage(config.folder, file);
      setImages((current) => [uploaded, ...current]);
    }
  };

  return (
    <>
      {showEasterEgg && <EasterEggListener />}

      <div className="min-h-dvh bg-background">
        <header className="border-b border-border bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-start gap-3">
              {backHref && (
                <Link
                  href={backHref}
                  className="mt-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Retour à la galerie"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </Link>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {config.folder === "special" ? (
                    <Sparkles
                      className="h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <Images
                      className="h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                  <h1 className="font-heading text-3xl tracking-wide text-foreground sm:text-4xl">
                    {config.title}
                  </h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  {config.subtitle}
                </p>
              </div>
            </div>

            {configured && (
              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={isRefreshing}
                className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Actualiser la galerie"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            )}
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          {!configured && <FirebaseSetupNotice />}

          {configured && config.allowUpload && (
            <section className="mb-10">
              <UploadZone onUpload={handleUpload} />
            </section>
          )}

          <section aria-label="Galerie de photos">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {config.folder === "special" ? "Trésors cachés" : "Galerie"}
                </h2>
                {!isLoading && configured && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {images.length === 0
                      ? "Aucune photo"
                      : `${images.length} photo${images.length > 1 ? "s" : ""}`}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {isLoading ? (
              <GallerySkeleton />
            ) : images.length > 0 ? (
              <ImageGrid images={images} />
            ) : configured ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                <Images
                  className="h-10 w-10 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <p className="mt-4 max-w-sm text-muted-foreground">
                  {config.emptyMessage}
                </p>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </>
  );
}
