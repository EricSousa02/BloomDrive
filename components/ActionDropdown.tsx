"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
  leaveFileShare,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const path = usePathname();

  // Busca o usuário atual ao montar o componente
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
      } finally {
        setIsUserLoaded(true);
      }
    };

    fetchCurrentUser();
  }, []);

  // Verifica se o usuário atual é o dono do arquivo
  const isOwner = currentUser && file.owner && currentUser.accountId === file.owner.accountId;

  // Filtra as ações baseado nas permissões
  const getAvailableActions = () => {
    if (!isUserLoaded || !currentUser) return actionsDropdownItems;
    
    return actionsDropdownItems.filter(action => {
      // Apenas o dono pode renomear e deletar
      if (action.value === 'rename' || action.value === 'delete') {
        return isOwner;
      }
      // Apenas quem não é dono pode sair do compartilhamento
      if (action.value === 'leave') {
        return !isOwner;
      }
      // Todos podem ver detalhes, compartilhar e baixar
      return true;
    });
  };

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    //   setEmails([]);
  };

  const handleAction = async () => {
    if (!action) return;
    
    // Verificação adicional de segurança no cliente
    if ((action.value === 'rename' || action.value === 'delete') && !isOwner) {
      alert('Apenas o proprietário pode realizar esta ação.');
      return;
    }

    if (action.value === 'leave' && isOwner) {
      alert('O proprietário não pode sair do próprio compartilhamento.');
      return;
    }
    
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path }),
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
      leave: () => leaveFileShare({ fileId: file.$id, path }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();

    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Tem certeza de que deseja excluir{` `}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
          {value === "leave" && (
            <p className="delete-confirmation">
              Tem certeza de que deseja sair do compartilhamento do arquivo{` `}
              <span className="delete-file-name">{file.name}</span>?
              <br />
              <span className="text-sm text-light-200 mt-2 block">
                Você não terá mais acesso a este arquivo.
              </span>
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share", "leave"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancelar
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{label}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            <div className="flex flex-col">
              <span>{file.name}</span>
              {isUserLoaded && (
                <>
                  {isOwner ? (
                    <span className="text-xs text-brand font-medium truncate">
                      👑 Seu arquivo
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 truncate">
                      📤 Compartilhado por {file.owner.fullName}
                    </span>
                  )}
                </>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {getAvailableActions().map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);

                if (
                  ["rename", "share", "delete", "details", "leave"].includes(
                    actionItem.value,
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};
export default ActionDropdown;
