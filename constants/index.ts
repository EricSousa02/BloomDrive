export const navItems = [
  {
    name: "Dashboard",
    icon: "/assets/icons/dashboard.svg",
    url: "/",
  },
  {
    name: "Documentos",
    icon: "/assets/icons/documents.svg",
    url: "/documents",
  },
  {
    name: "Imagens",
    icon: "/assets/icons/images.svg",
    url: "/images",
  },
  {
    name: "Mídia",
    icon: "/assets/icons/video.svg",
    url: "/media",
  },
  {
    name: "Outros",
    icon: "/assets/icons/others.svg",
    url: "/others",
  },
];

export const actionsDropdownItems = [
  {
    label: "Renomear",
    icon: "/assets/icons/edit.svg",
    value: "rename",
  },
  {
    label: "Detalhes",
    icon: "/assets/icons/info.svg",
    value: "details",
  },
  {
    label: "Compartilhar",
    icon: "/assets/icons/share.svg",
    value: "share",
  },
  {
    label: "Download",
    icon: "/assets/icons/download.svg",
    value: "download",
  },
  {
    label: "Deletar",
    icon: "/assets/icons/delete.svg",
    value: "delete",
  },
];

export const sortTypes = [
  {
    label: "Data (mais recente)",
    value: "$createdAt-desc",
  },
  {
    label: "Data (mais antiga)",
    value: "$createdAt-asc",
  },
  {
    label: "Nome (A-Z)",
    value: "name-asc",
  },
  {
    label: "Nome (Z-A)",
    value: "name-desc",
  },
  {
    label: "Tamanho (Maior)",
    value: "size-desc",
  },
  {
    label: "Tamanho (Menor)",
    value: "size-asc",
  },
];

export const avatarPlaceholderUrl =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
