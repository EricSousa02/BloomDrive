"use client";

import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize, constructSecureViewUrl, isFileViewable } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import ClientOnly from "@/components/ClientOnly";
import { useEffect, useState } from "react";

const Card = ({ file }: { file: Models.Document }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isCardReady, setIsCardReady] = useState(false);
  
  // Garante que o componente está montado no cliente
  useEffect(() => {
    setIsMounted(true);
    
    // Marca o card como pronto após hidratação
    const timer = setTimeout(() => {
      setIsCardReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Usa URL segura se o arquivo for visualizável, senão desabilita o link
  const isViewable = isFileViewable(file.extension);
  const viewUrl = isViewable ? constructSecureViewUrl(file.$id) : "#";
  
  const CardContent = () => (
    <>
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={isMounted && isViewable ? constructSecureViewUrl(file.$id) : file.url}
          className="!size-20"
          imageClassName="!size-11"
        />

        <div className="flex flex-col items-end justify-between">
          <ClientOnly fallback={<div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />}>
            {isCardReady ? <ActionDropdown file={file} /> : <div className="w-8 h-8" />}
          </ClientOnly>
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />
        <p className="caption line-clamp-1 text-light-200">
          Por: {file.owner.fullName}
        </p>
      </div>
    </>
  );

  if (!isMounted) {
    return (
      <div className="file-card cursor-default">
        <CardContent />
      </div>
    );
  }

  return isViewable ? (
    <Link href={viewUrl} target="_blank" className="file-card">
      <CardContent />
    </Link>
  ) : (
    <div className="file-card cursor-default">
      <CardContent />
    </div>
  );
};
export default Card;
