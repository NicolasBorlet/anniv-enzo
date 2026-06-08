"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";

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
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-surface hover:border-primary/40 hover:bg-muted/50",
          (disabled || isUploading) && "pointer-events-none opacity-60",
        ].join(" ")}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors duration-200 group-hover:bg-primary group-hover:text-on-primary">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-5 w-5" aria-hidden="true" />
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
