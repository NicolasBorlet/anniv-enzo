"use client";

import { useEffect, useState } from "react";
import { isHeicImage } from "@/lib/image-formats";
import type { GalleryImage } from "@/lib/types";

type DisplayableImageState = {
  src: string;
  isConverting: boolean;
  hasError: boolean;
  unoptimized: boolean;
};

export function useDisplayableImageUrl(image: GalleryImage): DisplayableImageState {
  const needsConversion = isHeicImage(image.name);
  const [src, setSrc] = useState(needsConversion ? "" : image.url);
  const [isConverting, setIsConverting] = useState(needsConversion);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!needsConversion) {
      setSrc(image.url);
      setIsConverting(false);
      setHasError(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    async function convertHeic() {
      setIsConverting(true);
      setHasError(false);
      setSrc("");

      try {
        const response = await fetch(image.url);
        if (!response.ok) {
          throw new Error("fetch failed");
        }

        const blob = await response.blob();
        const heic2any = (await import("heic2any")).default;
        const result = await heic2any({
          blob,
          toType: "image/jpeg",
          quality: 0.85,
        });
        const jpegBlob = Array.isArray(result) ? result[0] : result;
        objectUrl = URL.createObjectURL(jpegBlob);

        if (!cancelled) {
          setSrc(objectUrl);
          setIsConverting(false);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
          setIsConverting(false);
        }
      }
    }

    void convertHeic();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image.url, image.name, needsConversion]);

  return {
    src,
    isConverting,
    hasError,
    unoptimized: needsConversion,
  };
}
