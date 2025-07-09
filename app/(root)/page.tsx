"use client";

import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { useEffect, useState } from "react";

import ActionDropdown from "@/components/ActionDropdown";
import { Chart } from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { Thumbnail } from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, constructSecureViewUrl, isFileViewable } from "@/lib/utils";
import ClientOnly from "@/components/ClientOnly";
import { DashboardSummary } from "@/components/DashboardSummary";

const Dashboard = () => {
  const [files, setFiles] = useState<any>(null);
  const [totalSpace, setTotalSpace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Requisições paralelas
        const [filesData, totalSpaceData] = await Promise.all([
          getFiles({ types: [], limit: 10 }),
          getTotalSpaceUsed(),
        ]);
        
        setFiles(filesData);
        setTotalSpace(totalSpaceData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand/90"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!files || !totalSpace) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <section>
        <Chart used={totalSpace.used} />

        {/* Uploaded file type summaries */}
        <DashboardSummary totalSpace={totalSpace} />
      </section>

      {/* Recent files uploaded */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Arquivos recentes enviados</h2>
        {files.documents.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.documents.map((file: Models.Document) => {
              const isViewable = isFileViewable(file.extension);
              const viewUrl = isViewable ? constructSecureViewUrl(file.$id) : "#";
              
              const FileItem = () => (
                <>
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url} // Use URL original para SSR, será atualizada no cliente
                    size="small"
                  />

                  <div className="recent-file-details">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <p className="recent-file-name truncate">{file.name}</p>
                      <FormattedDateTime
                        date={file.$createdAt}
                        className="caption"
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <ClientOnly fallback={<div className="w-8 h-8" />}>
                        <ActionDropdown file={file} />
                      </ClientOnly>
                    </div>
                  </div>
                </>
              );

              return (
                <li key={file.$id}>
                  {isViewable ? (
                    <Link
                      href={viewUrl}
                      target="_blank"
                      className="flex items-center gap-3"
                    >
                      <FileItem />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 cursor-default">
                      <FileItem />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-list">Nenhum arquivo enviado</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
