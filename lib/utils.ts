import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const convertFileSize = (sizeInBytes: number, digits?: number) => {
  if (sizeInBytes < 1024) {
    return sizeInBytes + " Bytes"; // Menos de 1 KB, mostra em Bytes
  } else if (sizeInBytes < 1024 * 1024) {
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB.toFixed(digits || 1) + " KB"; // Menos de 1 MB, mostra em KB
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB.toFixed(digits || 1) + " MB"; // Menos de 1 GB, mostra em MB
  } else {
    const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
    return sizeInGB.toFixed(digits || 1) + " GB"; // 1 GB ou mais, mostra em GB
  }
};

export const calculatePercentage = (sizeInBytes: number) => {
  const totalSizeInBytes = 2 * 1024 * 1024 * 1024; // 2GB em bytes
  const percentage = (sizeInBytes / totalSizeInBytes) * 100;
  return Number(percentage.toFixed(2));
};

export const getFileType = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return { type: "other", extension: "" };

  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "xls",
    "xlsx",
    "csv",
    "rtf",
    "ods",
    "ppt",
    "odp",
    "md",
    "html",
    "htm",
    "epub",
    "pages",
    "fig",
    "psd",
    "ai",
    "indd",
    "xd",
    "sketch",
    "afdesign",
    "afphoto",
    "afphoto",
  ];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const videoExtensions = ["mp4", "avi", "mov", "mkv", "webm"];
  const audioExtensions = ["mp3", "wav", "ogg", "flac"];

  if (documentExtensions.includes(extension))
    return { type: "document", extension };
  if (imageExtensions.includes(extension)) return { type: "image", extension };
  if (videoExtensions.includes(extension)) return { type: "video", extension };
  if (audioExtensions.includes(extension)) return { type: "audio", extension };

  return { type: "other", extension };
};

export const formatDateTime = (isoString: string | null | undefined) => {
  if (!isoString) return "—";

  const date = new Date(isoString);

  // Obtém horas e ajusta para formato 12 horas
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";

  // Converte horas para formato 12 horas
  hours = hours % 12 || 12;

  // Formata as partes de tempo e data
  const time = `${hours}:${minutes.toString().padStart(2, "0")}${period}`;
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const month = monthNames[date.getMonth()];

  return `${time}, ${day} ${month}`;
};

export const getFileIcon = (
  extension: string | undefined,
  type: FileType | string,
) => {
  switch (extension) {
    // Documento
    case "pdf":
      return "/assets/icons/file-pdf.svg";
    case "doc":
      return "/assets/icons/file-doc.svg";
    case "docx":
      return "/assets/icons/file-docx.svg";
    case "csv":
      return "/assets/icons/file-csv.svg";
    case "txt":
      return "/assets/icons/file-txt.svg";
    case "xls":
    case "xlsx":
      return "/assets/icons/file-document.svg";
    // Imagem
    case "svg":
      return "/assets/icons/file-image.svg";
    // Vídeo
    case "mkv":
    case "mov":
    case "avi":
    case "wmv":
    case "mp4":
    case "flv":
    case "webm":
    case "m4v":
    case "3gp":
      return "/assets/icons/file-video.svg";
    // Áudio
    case "mp3":
    case "mpeg":
    case "wav":
    case "aac":
    case "flac":
    case "ogg":
    case "wma":
    case "m4a":
    case "aiff":
    case "alac":
      return "/assets/icons/file-audio.svg";

    default:
      switch (type) {
        case "image":
          return "/assets/icons/file-image.svg";
        case "document":
          return "/assets/icons/file-document.svg";
        case "video":
          return "/assets/icons/file-video.svg";
        case "audio":
          return "/assets/icons/file-audio.svg";
        default:
          return "/assets/icons/file-other.svg";
      }
  }
};

// UTILITÁRIOS DE URL DO APPWRITE
// ⚠️ DEPRECIADO: Estas funções expõem informações sensíveis e devem ser substituídas pelas URLs seguras
// Constrói URL de arquivo do appwrite - https://appwrite.io/docs/apis/rest#images
export const constructFileUrl = (bucketFileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};

// ⚠️ DEPRECIADO: Use constructSecureDownloadUrl() em vez desta função
export const constructDownloadUrl = (bucketFileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};

// UTILITÁRIOS DO DASHBOARD
export const getUsageSummary = (totalSpace: any, isDark = false) => {
  const iconSuffix = isDark ? "-dark" : "-light";
  
  return [
    {
      title: "Documentos",
      size: totalSpace.document.size,
      latestDate: totalSpace.document.latestDate,
      icon: `/assets/icons/file-document${iconSuffix}.svg`,
      url: "/Documentos",
    },
    {
      title: "Imagens",
      size: totalSpace.image.size,
      latestDate: totalSpace.image.latestDate,
      icon: `/assets/icons/file-image${iconSuffix}.svg`,
      url: "/Imagens",
    },
    {
      title: "Midia",
      size: totalSpace.video.size + totalSpace.audio.size,
      latestDate:
        totalSpace.video.latestDate > totalSpace.audio.latestDate
          ? totalSpace.video.latestDate
          : totalSpace.audio.latestDate,
      icon: `/assets/icons/file-video${iconSuffix}.svg`,
      url: "/Midia",
    },
    {
      title: "Outros",
      size: totalSpace.other.size,
      latestDate: totalSpace.other.latestDate,
      icon: `/assets/icons/file-other${iconSuffix}.svg`,
      url: "/Outros",
    },
  ];
};

export const getFileTypesParams = (type: string) => {
  switch (type) {
    case "Documentos":
      return ["document"];
    case "Imagens":
      return ["image"];
    case "Midia":
      return ["video", "audio"];
    case "Outros":
      return ["other"];
    default:
      return ["document"];
  }
};

// URL segura para visualização de arquivos via proxy interno
export const constructSecureViewUrl = (fileId: string) => {
  return `/api/files/${fileId}/view`;
};

// URL segura para download de arquivos via proxy interno
export const constructSecureDownloadUrl = (fileId: string, fileName: string) => {
  return `/api/files/${fileId}/download?filename=${encodeURIComponent(fileName)}`;
};

// Função para verificar se o arquivo é visualizável no navegador
export const isFileViewable = (extension: string) => {
  const viewableExtensions = [
    // Imagens
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    // Documentos
    'pdf', 'txt', 'md', 'json', 'xml', 'csv',
    // Vídeos
    'mp4', 'webm', 'ogv',
    // Áudios  
    'mp3', 'wav', 'oga', 'aac'
  ];
  return viewableExtensions.includes(extension.toLowerCase());
};

// Função para verificar se o arquivo deve ser reproduzido no navegador
export const isMediaPlayable = (extension: string) => {
  const playableExtensions = [
    'mp4', 'webm', 'ogv', // vídeos
    'mp3', 'wav', 'aac', 'oga'   // áudios
  ];
  return playableExtensions.includes(extension.toLowerCase());
};

// Função para verificar se é arquivo de vídeo
export const isVideoFile = (extension: string) => {
  const videoExtensions = ['mp4', 'webm', 'ogv', 'avi', 'mov'];
  return videoExtensions.includes(extension.toLowerCase());
};
