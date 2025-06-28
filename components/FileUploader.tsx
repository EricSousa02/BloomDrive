"use client";

import React, { useCallback, useState } from "react";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const simulateProgress = (fileName: string, fileSize: number): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const increment = Math.random() * 15 + 5; // 5-20% increments
      const baseTime = Math.min(fileSize / 1000000 * 100, 300); // Base time based on file size
      
      const interval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
          progress = 100;
          setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
          clearInterval(interval);
          resolve();
        } else {
          setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
        }
      }, baseTime + Math.random() * 200); // Varying interval for realistic feel
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> é muito grande.
                O tamanho máximo do arquivo é 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        // Initialize progress for this file
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Start progress simulation
        const progressPromise = simulateProgress(file.name, file.size);

        // Start actual upload
        const uploadPromise = uploadFile({ file, ownerId, accountId, path }).then(
          (uploadedFile) => {
            if (uploadedFile) {
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name),
              );
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
              });
            }
          },
        );

        // Wait for both progress simulation and upload to complete
        await Promise.all([progressPromise, uploadPromise]);
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string,
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button w-full", className)}>
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />{" "}
        <p>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Carregando</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    {file.name}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-black/20 relative overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress[file.name] || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-light-100 min-w-[40px] text-right">
                        {Math.round(uploadProgress[file.name] || 0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
