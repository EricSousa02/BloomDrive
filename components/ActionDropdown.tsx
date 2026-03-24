"use client";

/*
 * TODO: TEMPORÁRIO - Fast Origin Transfer da Vercel
 * 
 * Todas as verificações de propriedade foram comentadas temporariamente
 * devido ao problema do Fast Origin Transfer da Vercel estar esgotado.
 * 
 * Atualmente TODOS os usuários podem:
 * - Renomear arquivos
 * - Deletar arquivos  
 * - Compartilhar arquivos
 * - Remover usuários do compartilhamento
 * 
 * A função "Sair do compartilhamento" foi desativada temporariamente.
 * 
 * PRÓXIMO MÊS: Descomentar todas as verificações marcadas com "TODO"
 * quando o Fast Origin Transfer estiver ativo novamente.
 */

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
import { constructSecureDownloadUrl } from "@/lib/utils";
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
  // Função utilitária para extrair o nome base sem extensão
  const getFileNameWithoutExtension = (fileName: string) => {
    const nameParts = fileName.split('.');
    if (nameParts.length > 1) {
      nameParts.pop(); // Remove a última parte (extensão)
      return nameParts.join('.');
    }
    return fileName;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(() => getFileNameWithoutExtension(file.name));
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const path = usePathname();

  // Garantir que o componente está montado no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Atualiza o nome quando o arquivo é alterado (após renomeação)
  useEffect(() => {
    setName(getFileNameWithoutExtension(file.name));
  }, [file.name]);

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
        // Erro silencioso - usuário não autenticado
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
    return actionsDropdownItems.filter(action => {
      if (!isMounted || !isUserLoaded || !currentUser) return actionsDropdownItems;
      
      // Apenas o dono pode renomear e deletar
      if (action.value === 'rename' || action.value === 'delete') {
        return isOwner;
      }
      // Apenas quem não é dono pode sair do compartilhamento
      if (action.value === 'leave') {
        return !isOwner;
      }
      
      return true;
    });
  };

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    // Redefine o nome base (sem extensão) para o input
    setName(getFileNameWithoutExtension(file.name));
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

    // Validação para o nome do arquivo
    if (action.value === 'rename' && (!name || name.trim() === '')) {
      alert('O nome do arquivo não pode estar vazio.');
      return;
    }
    
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name: name.trim(), extension: file.extension, path }),
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
    // Verificação de segurança: apenas o dono pode remover usuários
    if (!isOwner) {
      alert('Apenas o proprietário do arquivo pode remover usuários do compartilhamento.');
      return;
    }

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
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do arquivo (sem extensão)"
                className="shad-input"
              />
              <p className="text-xs text-light-200">
                Extensão: .{file.extension}
              </p>
            </div>
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
              isOwner={isOwner}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Tem certeza de que deseja excluir{` `}
              <span className="delete-file-name truncate block max-w-[250px] mx-auto" title={file.name}>{file.name}</span>?
            </p>
          )}
          {value === "leave" && (
            <p className="delete-confirmation">
              Tem certeza de que deseja sair do compartilhamento do arquivo{` `}
              <span className="delete-file-name truncate block max-w-[250px] mx-auto" title={file.name}>{file.name}</span>?
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
        <DropdownMenuContent 
          className="shad-dropdown-content"
          align="end"
          side="bottom"
          sideOffset={5}
          collisionPadding={16}
          avoidCollisions={true}
        >
          <DropdownMenuLabel className="max-w-[200px] truncate">
            <div className="flex flex-col">
              <span className="truncate max-w-[180px]">{file.name}</span>
              {isMounted && isUserLoaded && (
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
                <a
                  href={constructSecureDownloadUrl(file.$id, file.name)}
                  download={file.name}
                  className="flex items-center gap-2"
                  target="_self"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </a>
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
