"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StorageReference } from "firebase/storage";
import {
  loadAllImageDetails,
  loadImagePage,
  listSortedImageRefs,
} from "@/lib/firebase/storage";
import type { GalleryImage, StorageFolder } from "@/lib/types";

const LOAD_ERROR =
  "Impossible de charger les photos. Vérifiez votre connexion.";

export function useGalleryImages(folder: StorageFolder, enabled: boolean) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [total, setTotal] = useState(0);
  const [refs, setRefs] = useState<StorageReference[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);

  const resetState = useCallback(() => {
    setImages([]);
    setTotal(0);
    setRefs([]);
    setOffset(0);
    setHasMore(false);
    loadingMoreRef.current = false;
  }, []);

  const loadInitial = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sortedRefs = await listSortedImageRefs(folder);
      const page = await loadImagePage(sortedRefs, 0);

      setRefs(sortedRefs);
      setTotal(sortedRefs.length);
      setImages(page.images);
      setOffset(page.images.length);
      setHasMore(page.hasMore);
    } catch {
      setError(LOAD_ERROR);
      resetState();
    } finally {
      setIsLoading(false);
    }
  }, [enabled, folder, resetState]);

  useEffect(() => {
    resetState();
    void loadInitial();
  }, [folder, enabled, loadInitial, resetState]);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setError(null);

    try {
      const sortedRefs = await listSortedImageRefs(folder);
      const page = await loadImagePage(sortedRefs, 0);

      setRefs(sortedRefs);
      setTotal(sortedRefs.length);
      setImages(page.images);
      setOffset(page.images.length);
      setHasMore(page.hasMore);
    } catch {
      setError(LOAD_ERROR);
    }
  }, [enabled, folder]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || loadingMoreRef.current || refs.length === 0) {
      return;
    }

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const page = await loadImagePage(refs, offset);

      setImages((current) => [...current, ...page.images]);
      setOffset((current) => current + page.images.length);
      setHasMore(page.hasMore);
    } catch {
      setError(LOAD_ERROR);
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [enabled, hasMore, offset, refs]);

  const prependImage = useCallback((image: GalleryImage) => {
    setImages((current) => [image, ...current]);
    setTotal((current) => current + 1);
    setOffset((current) => current + 1);
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages((current) => current.filter((item) => item.id !== imageId));
    setRefs((current) => current.filter((item) => item.fullPath !== imageId));
    setTotal((current) => Math.max(0, current - 1));
    setOffset((current) => Math.max(0, current - 1));
  }, []);

  const loadAllForDownload = useCallback(async (): Promise<GalleryImage[]> => {
    if (refs.length === 0) return images;
    return loadAllImageDetails(refs);
  }, [images, refs]);

  return {
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
  };
}
