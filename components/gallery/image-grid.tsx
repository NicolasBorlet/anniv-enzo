"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageCard } from "./image-card";
import { Lightbox } from "./lightbox";
import { downloadImage } from "@/lib/download";
import type { GalleryImage } from "@/lib/types";

type ImageGridProps = {
  images: GalleryImage[];
  isSuperAdmin?: boolean;
  onDelete?: (image: GalleryImage) => Promise<void>;
  deletingId?: string | null;
};

export function ImageGrid({
  images,
  isSuperAdmin = false,
  onDelete,
  deletingId = null,
}: ImageGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null
        ? null
        : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const handleDownload = useCallback(async (image: GalleryImage) => {
    try {
      setDownloadError(null);
      await downloadImage(image);
    } catch {
      setDownloadError("Impossible de télécharger cette photo.");
    }
  }, []);

  const handleDelete = useCallback(
    async (image: GalleryImage) => {
      if (!onDelete) return;

      const confirmed = window.confirm(
        `Supprimer « ${image.name} » ? Cette action est irréversible.`,
      );
      if (!confirmed) return;

      await onDelete(image);

      setLightboxIndex((current) => {
        if (current === null) return null;
        if (images.length <= 1) return null;
        if (current >= images.length - 1) {
          return Math.max(0, current - 1);
        }
        return current;
      });
    },
    [onDelete, images.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  const activeLightboxIndex =
    lightboxIndex !== null && images.length > 0
      ? Math.min(lightboxIndex, images.length - 1)
      : null;

  return (
    <>
      {downloadError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {downloadError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            index={index}
            onOpen={setLightboxIndex}
            onDownload={(selected) => void handleDownload(selected)}
            onDelete={
              isSuperAdmin && onDelete
                ? (selected) => void handleDelete(selected)
                : undefined
            }
            isSuperAdmin={isSuperAdmin}
            isDeleting={deletingId === image.id}
          />
        ))}
      </div>

      {activeLightboxIndex !== null && images[activeLightboxIndex] && (
        <Lightbox
          images={images}
          currentIndex={activeLightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
          onDownload={(selected) => void handleDownload(selected)}
          onDelete={
            isSuperAdmin && onDelete
              ? (selected) => void handleDelete(selected)
              : undefined
          }
          isSuperAdmin={isSuperAdmin}
          isDeleting={deletingId === images[activeLightboxIndex].id}
        />
      )}
    </>
  );
}
