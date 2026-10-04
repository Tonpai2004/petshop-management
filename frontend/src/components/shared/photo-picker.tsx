"use client";

import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/image";
import { cn } from "@/lib/utils";

interface PhotoPickerProps {
  previewUrl: string | null;
  isProcessing?: boolean;
  error?: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}

export function PhotoPicker({
  previewUrl,
  isProcessing,
  error,
  onPick,
  onRemove,
  onError,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onError("Please choose a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      onError("That image is over 10 MB. Please pick a smaller one.");
      return;
    }

    onPick(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium">Photo</span>

      <div className="flex items-center gap-4">
        <div
          role="button"
          tabIndex={0}
          aria-label={previewUrl ? "Change photo" : "Upload a photo"}
          onClick={openPicker}
          onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && openPicker()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "group relative flex size-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors outline-none",
            "focus-visible:ring-ring/50 focus-visible:ring-3",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/50 hover:bg-muted/50",
            previewUrl && "border-solid",
            error && "border-destructive",
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Pet photo preview" className="size-full object-cover" />
          ) : (
            <ImagePlus className="text-muted-foreground group-hover:text-primary size-7 transition-colors" />
          )}

          {isProcessing && (
            <span className="bg-background/70 absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-5 animate-spin" />
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <p className="text-muted-foreground text-xs leading-relaxed">
            Drag a photo here or click the box.
            <br />
            JPG, PNG or WebP. Large photos are resized automatically.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPicker}
              disabled={isProcessing}
            >
              {previewUrl ? <RefreshCw /> : <ImagePlus />}
              {previewUrl ? "Replace" : "Choose photo"}
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={isProcessing}
              >
                <Trash2 />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
