"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Download,
  Images,
  Loader2,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EasterEggListener } from "@/components/easter-egg/easter-egg-listener";
import { FirebaseSetupNotice } from "@/components/gallery/firebase-setup-notice";
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton";
import { ImageGrid } from "@/components/gallery/image-grid";
import { UploadZone } from "@/components/gallery/upload-zone";
import { downloadAllImages } from "@/lib/download";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { deleteImage, uploadImage } from "@/lib/firebase/storage";
import { useGalleryImages } from "@/lib/hooks/use-gallery-images";
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
  const { isSuperAdmin } = useAuth();
  const configured = isFirebaseConfigured();
  const canUpload =
    configured &&
    config.allowUpload &&
    (!config.adminOnlyUpload || isSuperAdmin);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    images,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    setError,
    refresh,
    loadMore,
    prependImage,
    removeImage,
    loadAllForDownload,
  } = useGalleryImages(config.folder, configured);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      const uploaded = await uploadImage(config.folder, file);
      prependImage(uploaded);
    }
  };

  const handleDownloadAll = async () => {
    if (total === 0) return;

    setIsDownloadingAll(true);
    setError(null);

    try {
      const allImages = await loadAllForDownload();
      await downloadAllImages(allImages);
    } catch {
      setError("Impossible de télécharger toutes les photos.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    setDeletingId(image.id);
    setError(null);

    try {
      await deleteImage(image.id);
      removeImage(image.id);
    } catch {
      setError("Impossible de supprimer cette photo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {showEasterEgg && <EasterEggListener />}

      <div className="min-h-dvh">
        <header className="border-b border-border bg-surface/80 backdrop-blur-md shadow-[0_4px_32px_var(--glow-primary),0_0_40px_var(--glow-accent)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-start gap-3">
              {backHref && (
                <Link
                  href={backHref}
                  className="mt-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-primary hover:shadow-[0_0_12px_var(--glow-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Retour à la galerie"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </Link>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {config.folder === "special" ? (
                    <Sparkles
                      className="h-5 w-5 shrink-0 text-accent icon-glow motion-safe:animate-sparkle"
                      aria-hidden="true"
                    />
                  ) : config.folder === "guest" ? (
                    <Camera
                      className="h-5 w-5 shrink-0 text-secondary icon-glow motion-safe:animate-sparkle"
                      aria-hidden="true"
                    />
                  ) : (
                    <Images
                      className="h-5 w-5 shrink-0 text-primary icon-glow motion-safe:animate-sparkle"
                      aria-hidden="true"
                    />
                  )}
                  <h1 className="font-heading text-3xl font-semibold tracking-tight text-magic-gradient sm:text-4xl">
                    {config.title}
                  </h1>
                </div>
                <p className="mt-1 font-accent text-xl text-secondary sm:text-2xl">
                  {config.subtitle}
                </p>
              </div>
            </div>

            {configured && (
              <div className="flex shrink-0 items-center gap-2">
                {isSuperAdmin && config.folder === "gallery" && (
                  <Link
                    href="/upload"
                    className="glass-card flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Users className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Photos invités</span>
                  </Link>
                )}

                {!isLoading && total > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleDownloadAll()}
                    disabled={isDownloadingAll}
                    className="glass-card flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Télécharger toutes les photos"
                  >
                    {isDownloadingAll ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Download className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline">
                      {isDownloadingAll ? "Téléchargement…" : "Tout télécharger"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing}
                  className="glass-card flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Actualiser la galerie"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          {!configured && <FirebaseSetupNotice />}

          {canUpload && (
            <section className="mb-10">
              <UploadZone
                onUpload={handleUpload}
                hint={
                  config.folder === "guest"
                    ? "Vos photos seront ajoutées à la collection des invités."
                    : "Les photos seront ajoutées à la galerie publique."
                }
              />
            </section>
          )}

          <section aria-label="Galerie de photos">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {config.folder === "special"
                    ? "Trésors cachés"
                    : config.folder === "guest"
                      ? "Photos des invités"
                      : "Galerie"}
                </h2>
                {!isLoading && configured && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {total === 0
                      ? "Aucune photo"
                      : hasMore
                        ? `${images.length} / ${total} photo${total > 1 ? "s" : ""}`
                        : `${total} photo${total > 1 ? "s" : ""}`}
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
              <>
                <ImageGrid
                  images={images}
                  isSuperAdmin={isSuperAdmin}
                  onDelete={isSuperAdmin ? handleDelete : undefined}
                  deletingId={deletingId}
                />

                {(hasMore || isLoadingMore) && (
                  <div
                    ref={loadMoreRef}
                    className="flex justify-center py-8"
                    aria-live="polite"
                    aria-busy={isLoadingMore}
                  >
                    {isLoadingMore && (
                      <Loader2
                        className="h-6 w-6 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="sr-only">
                      {isLoadingMore
                        ? "Chargement de photos supplémentaires"
                        : "Faites défiler pour charger plus de photos"}
                    </span>
                  </div>
                )}
              </>
            ) : configured ? (
              <div className="glass-card flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-16 text-center">
                <Sparkles
                  className="h-10 w-10 text-accent/60 icon-glow motion-safe:animate-sparkle"
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
