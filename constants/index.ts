export const navItems = [
  {
    name: "Dashboard",
    icon: "/assets/icons/dashboard.svg",
    url: "/",
  },
  {
    name: "Documentos",
    icon: "/assets/icons/documents.svg",
    url: "/Documentos",
  },
  {
    name: "Imagens",
    icon: "/assets/icons/images.svg",
    url: "/Imagens",
  },
  {
    name: "Midia",
    icon: "/assets/icons/video.svg",
    url: "/Midia",
  },
  {
    name: "Outros",
    icon: "/assets/icons/others.svg",
    url: "/Outros",
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
    label: "Sair do compartilhamento",
    icon: "/assets/icons/delete.svg",
    value: "leave",
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
    value: "$updatedAt-desc",
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

export const avatarPlaceholderUrl = "/assets/images/avatar.jpg";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
