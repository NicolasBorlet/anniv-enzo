"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, ImageOff, Loader2, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDisplayableImageUrl } from "@/lib/hooks/use-displayable-image-url";
import type { GalleryImage } from "@/lib/types";

type LightboxProps = {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDownload: (image: GalleryImage) => void;
  onDelete?: (image: GalleryImage) => void;
  isSuperAdmin?: boolean;
  isDeleting?: boolean;
};

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onDownload,
  onDelete,
  isSuperAdmin = false,
  isDeleting = false,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = images[currentIndex];
  const { src, isConverting, hasError, unoptimized } =
    useDisplayableImageUrl(image);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a0520]/88 p-4 backdrop-blur-lg motion-reduce:backdrop-blur-none"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(217,70,239,0.15), transparent 70%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualisation : ${image.name}`}
      onClick={onClose}
    >
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDownload(image);
          }}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-primary/30 text-white shadow-[0_0_12px_var(--glow-primary)] transition-all duration-200 hover:bg-primary/50 hover:shadow-[0_0_20px_var(--glow-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Télécharger ${image.name}`}
        >
          <Download className="h-5 w-5" aria-hidden="true" />
        </button>

        {isSuperAdmin && onDelete && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(image);
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-destructive/80 text-white transition-colors duration-200 hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Supprimer ${image.name}`}
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-secondary/30 text-white shadow-[0_0_12px_var(--glow-secondary)] transition-all duration-200 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary/30 text-white shadow-[0_0_12px_var(--glow-primary)] transition-all duration-200 hover:bg-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary/30 text-white shadow-[0_0_12px_var(--glow-primary)] transition-all duration-200 hover:bg-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-16"
            aria-label="Photo suivante"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}

      <figure
        className="relative flex max-h-[85vh] max-w-5xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex min-h-[40vh] max-h-[75vh] w-full items-center justify-center">
          {isConverting && (
            <Loader2
              className="h-10 w-10 animate-spin text-white/70"
              aria-hidden="true"
            />
          )}

          {hasError && !isConverting && (
            <div className="flex flex-col items-center gap-3 px-6 text-center text-white/80">
              <ImageOff className="h-12 w-12" aria-hidden="true" />
              <p className="text-sm">
                Aperçu indisponible pour ce format. Téléchargez la photo pour
                la consulter.
              </p>
            </div>
          )}

          {src && !hasError && (
            <Image
              src={src}
              alt={image.name}
              width={1200}
              height={900}
              unoptimized={unoptimized}
              className="mx-auto max-h-[75vh] w-auto rounded-xl object-contain shadow-[0_0_40px_var(--glow-primary),0_0_60px_var(--glow-gold)]"
              priority
            />
          )}
        </div>
        <figcaption className="mt-4 text-center text-sm text-white/80">
          {image.name}
          {images.length > 1 && (
            <span className="ml-2 text-white/50">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
