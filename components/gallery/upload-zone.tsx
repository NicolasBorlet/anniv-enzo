"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Loader2, Sparkles, Upload } from "lucide-react";

type UploadZoneProps = {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
  hint?: string;
};

const ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif";

export function UploadZone({
  onUpload,
  disabled = false,
  hint = "Vos photos seront visibles par tous les visiteurs du site.",
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (imageFiles.length === 0) {
        setError("Veuillez sélectionner au moins une image.");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        await onUpload(imageFiles);
      } catch {
        setError("L'envoi a échoué. Réessayez dans un instant.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      void handleFiles(event.dataTransfer.files);
    },
    [disabled, handleFiles, isUploading],
  );

  return (
    <section aria-label="Zone d'envoi de photos" className="w-full">
      <div
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        aria-disabled={disabled || isUploading}
        aria-busy={isUploading}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (
            (event.key === "Enter" || event.key === " ") &&
            !disabled &&
            !isUploading
          ) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          "group relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 shadow-[0_0_24px_var(--glow-primary)] scale-[1.01]"
            : "glass-card hover:border-primary/40 hover:shadow-[0_4px_20px_var(--glow-primary)]",
          (disabled || isUploading) && "pointer-events-none opacity-60",
        ].join(" ")}
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary group-hover:shadow-[0_0_24px_var(--glow-primary),0_0_12px_var(--glow-gold)]">
          <Sparkles
            className="absolute -right-1 -top-1 h-4 w-4 text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-safe:animate-sparkle"
            aria-hidden="true"
          />
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin icon-glow" aria-hidden="true" />
          ) : (
            <Upload className="h-6 w-6 motion-safe:group-hover:animate-sparkle" aria-hidden="true" />
          )}
        </div>

        <div>
          <p className="font-medium text-foreground">
            {isUploading
              ? "Envoi en cours…"
              : "Glissez vos photos ici ou cliquez pour parcourir"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            JPG, PNG, WebP, GIF — plusieurs fichiers acceptés
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={(event) => {
            if (event.target.files) {
              void handleFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Camera className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {hint}
      </p>
    </section>
  );
}
