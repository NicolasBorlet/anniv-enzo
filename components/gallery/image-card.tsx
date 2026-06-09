"use client";

import Image from "next/image";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import type { GalleryImage } from "@/lib/types";

type ImageCardProps = {
  image: GalleryImage;
  index: number;
  onOpen: (index: number) => void;
  onDownload: (image: GalleryImage) => void;
  onDelete?: (image: GalleryImage) => void;
  isSuperAdmin?: boolean;
  isDeleting?: boolean;
};

export function ImageCard({
  image,
  index,
  onOpen,
  onDownload,
  onDelete,
  isSuperAdmin = false,
  isDeleting = false,
}: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={() => onOpen(index)}
        className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Ouvrir ${image.name}`}
      >
        <Image
          src={image.url}
          alt={image.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
        />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
        <p className="truncate pr-20 text-left text-xs font-medium text-white">
          {image.name}
        </p>
      </div>

      <div className="absolute right-2 top-2 z-20 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:opacity-100">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDownload(image);
          }}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Télécharger ${image.name}`}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>

        {isSuperAdmin && onDelete && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(image);
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-destructive/90 text-white transition-colors duration-200 hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Supprimer ${image.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
