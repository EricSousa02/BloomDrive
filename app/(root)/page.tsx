import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";

import ActionDropdown from "@/components/ActionDropdown";
import { Chart } from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { Thumbnail } from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, constructSecureViewUrl, isFileViewable } from "@/lib/utils";
import ClientOnly from "@/components/ClientOnly";
import { DashboardSummary } from "@/components/DashboardSummary";

const Dashboard = async () => {
  // Requisições paralelas
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

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
