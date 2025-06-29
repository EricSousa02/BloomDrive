import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Formato:" value={file.extension} />
        <DetailRow label="Tamanho:" value={convertFileSize(file.size)} />
        <DetailRow label="Proprietário:" value={file.owner.fullName} />
        <DetailRow label="Última edição:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
};

interface Props {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  const [inputEmail, setInputEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Função para validar email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para adicionar email(s)
  const handleAddEmails = () => {
    if (!inputEmail.trim()) {
      setEmailError("Digite um e-mail válido");
      return;
    }

    // Limpa mensagens anteriores
    setEmailError("");
    setSuccessMessage("");

    // Verifica se contém vírgulas (múltiplos emails)
    const emailsToAdd = inputEmail.split(",").map(email => email.trim()).filter(email => email);
    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    emailsToAdd.forEach(email => {
      if (isValidEmail(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      setEmailError(`E-mail(s) inválido(s): ${invalidEmails.join(", ")}`);
      return;
    }

    // Verifica se algum email já está na lista
    const currentEmails = file.users || [];
    const existingEmails = validEmails.filter(email => currentEmails.includes(email));
    if (existingEmails.length > 0) {
      setEmailError(`E-mail(s) já compartilhado(s): ${existingEmails.join(", ")}`);
      return;
    }

    // Adiciona os novos emails à lista existente (sem sobrescrever)
    const updatedEmails = [...currentEmails, ...validEmails];
    
    onInputChange(updatedEmails);

    // Mostra mensagem de sucesso
    const emailCount = validEmails.length;
    const emailText = emailCount === 1 ? "E-mail adicionado" : `${emailCount} e-mails adicionados`;
    setSuccessMessage(`${emailText}: ${validEmails.join(", ")}`);

    // Limpa o input
    setInputEmail("");

    // Remove mensagem de sucesso após 3 segundos
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // Função para lidar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmails();
    }
  };

  // Função para limpar mensagens ao digitar
  const handleInputChange = (value: string) => {
    setInputEmail(value);
    if (emailError) setEmailError("");
    if (successMessage) setSuccessMessage("");
  };

  return (
    <>
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-light-100">
          Compartilhar arquivo com outros usuários
        </p>
        
        <div className="flex gap-2 mt-2">
          <Input
            type="email"
            placeholder="exemplo@email.com"
            value={inputEmail}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="share-input-field flex-1"
          />
          <Button
            onClick={handleAddEmails}
            className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg"
            disabled={!inputEmail.trim()}
          >
            Adicionar
          </Button>
        </div>

        {/* Dica de uso */}
        <p className="text-sm text-gray-500 mt-1">
          💡 Dica: Você pode adicionar vários e-mails separados por vírgula
        </p>

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="flex items-center gap-2 text-sm text-brand mt-2 bg-brand/10 p-3 rounded-lg border border-brand/20 shadow-sm">
            <div className="flex-shrink-0">
              <svg 
                className="w-5 h-5 text-brand" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Erro de validação */}
        {emailError && (
          <div className="flex items-center gap-2 text-sm text-red-700 mt-2 bg-red-50 p-3 rounded-lg border border-red-200 shadow-sm">
            <div className="flex-shrink-0">
              <svg 
                className="w-5 h-5 text-red-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <span className="font-medium">{emailError}</span>
          </div>
        )}

        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Compartilhado com</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} usuário{file.users.length !== 1 ? 's' : ''}
            </p>
          </div>

          {file.users.length === 0 ? (
            <div className="pt-2 text-center text-gray-500">
              <p className="text-sm">Nenhum usuário adicionado ainda</p>
              <p className="text-xs">Adicione e-mails acima para compartilhar</p>
            </div>
          ) : (
            <ul className="pt-2 space-y-2">
              {file.users.map((email: string) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="subtitle-2">{email}</p>
                  </div>
                  <Button
                    onClick={() => onRemove(email)}
                    className="share-remove-user hover:bg-red-100"
                    size="sm"
                  >
                    <Image
                      src="/assets/icons/remove.svg"
                      alt="Remover"
                      width={16}
                      height={16}
                      className="remove-icon"
                    />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
