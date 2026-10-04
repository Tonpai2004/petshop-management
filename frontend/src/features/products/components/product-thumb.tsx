"use client";

import { useState } from "react";
import { resolveAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { getCategoryLook } from "../looks";

interface ProductThumbProps {
  name: string;
  categoryName: string;
  imageUrl?: string | null;
  className?: string;
  iconClassName?: string;
}

/** Product photo, or the category's icon on a tinted tile when there isn't one yet. */
export function ProductThumb({
  name,
  categoryName,
  imageUrl,
  className,
  iconClassName,
}: ProductThumbProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const look = getCategoryLook(categoryName);
  const Icon = look.icon;
  const src = resolveAssetUrl(imageUrl);

  if (src && !imageFailed) {
    return (
      // Photos come from our own API host, which next/image would need configuring for per environment.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        onError={() => setImageFailed(true)}
        className={cn("size-10 shrink-0 rounded-lg object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        look.className,
        className,
      )}
    >
      <Icon className={cn("size-[18px]", iconClassName)} />
    </span>
  );
}
