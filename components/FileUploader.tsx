"use client";

import React, { useCallback, useState } from "react";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFileDirectly } from "@/lib/appwrite/client";
import { usePathname, useRouter } from "next/navigation";
import { UploadProgress } from "appwrite";

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

        // Inicializa o progresso para este arquivo
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Inicia o upload direto para o Appwrite
        const uploadPromise = uploadFileDirectly({ 
          file, 
          ownerId, 
          accountId,
          onProgress: (progress: UploadProgress) => {
            // Calcula progresso real baseado nos bytes enviados
            const percent = progress.chunksTotal > 0 
              ? Math.round((progress.chunksUploaded / progress.chunksTotal) * 100)
              : 0;
            setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
          }
        }).then(
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
              
              // Recarrega a página para mostrar o novo arquivo
              window.location.reload();
            }
          },
        ).catch((error) => {
          // Remove o arquivo da lista em caso de erro
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
          
          // Tratamento específico para diferentes tipos de erro
          let errorMessage = "Erro no upload do arquivo.";
          
          if (error?.message?.includes('413') || error?.status === 413) {
            errorMessage = "Arquivo muito grande. Limite do Appwrite é 50MB.";
          } else if (error?.message?.includes('timeout')) {
            errorMessage = "Upload demorou muito tempo. Verifique sua conexão.";
          }
          
          toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span>: {errorMessage}
              </p>
            ),
            className: "error-toast",
          });
        });

        // Aguarda o upload completar
        await uploadPromise;
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
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
          {/* Indicador de drag para mobile */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
          
          <div className="flex items-center justify-between mb-3">
            <h4 className="h4 text-light-100 text-base sm:text-lg">Carregando</h4>
            <span className="text-xs text-light-200 sm:text-sm">
              {files.length} arquivo{files.length > 1 ? 's' : ''}
            </span>
          </div>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Thumbnail
                      type={type}
                      extension={extension}
                      url={convertFileToUrl(file)}
                      className="!size-8 sm:!size-12"
                      imageClassName="!size-6 sm:!size-8"
                    />
                  </div>

                  <div className="preview-item-name flex-1 min-w-0">
                    <p className="truncate text-sm sm:text-base font-medium">
                      {file.name}
                    </p>
                    <div className="mt-1 sm:mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-black/20 relative overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress[file.name] || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-light-100 min-w-[35px] sm:min-w-[40px] text-right font-medium">
                        {Math.round(uploadProgress[file.name] || 0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveFile(e, file.name)}
                  className="flex-shrink-0 p-1 hover:bg-red/10 rounded transition-colors"
                  aria-label="Remover arquivo"
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    width={20}
                    height={20}
                    alt="Remove"
                    className="sm:w-6 sm:h-6"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
