"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryImage } from "@/lib/types";

type ImageCardProps = {
  image: GalleryImage;
  index: number;
  onOpen: (index: number) => void;
};

export function ImageCard({ image, index, onOpen }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Ouvrir ${image.name}`}
    >
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          aria-hidden="true"
        />
      )}
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
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        aria-hidden="true"
      >
        <p className="truncate text-left text-xs font-medium text-white">
          {image.name}
        </p>
      </div>
    </button>
  );
}
