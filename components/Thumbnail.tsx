"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
  size = 'small',
}: Props) => {
  const [hasError, setHasError] = useState(false);
  const isImage = type === "image" && extension !== "svg";

  // Sempre usa a mesma lógica no servidor e cliente
  const imageUrl = isImage && !hasError ? url : getFileIcon(extension, type);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={imageUrl}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && !hasError && "thumbnail-image",
        )}
        unoptimized={url.startsWith("/api/files/")}
        quality={95}
        loading={size === 'small' ? 'lazy' : 'eager'}
        onError={handleError}
        // Remover placeholder que pode causar problemas de hidratação
        // placeholder="blur"
        // blurDataURL="..."
      />
    </figure>
  );
};

export default Thumbnail;
