"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Schema de validação do OTP
const otpSchema = z.object({
  otp: z.string()
    .length(6, "O código deve ter exatamente 6 dígitos")
    .regex(/^\d{6}$/, "O código deve conter apenas números")
});

const OtpModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Limpa erros anteriores

    // Validação com Zod
    try {
      otpSchema.parse({ otp: password });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    console.log({ accountId, password });

    try {
      const sessionId = await verifySecret({ accountId, password });

      console.log({ sessionId });

      if (sessionId) {
        router.push("/");
      } else {
        setError("Código OTP inválido. Verifique e tente novamente.");
      }
    } catch (error) {
      console.log("Failed to verify OTP", error);
      setError("Código OTP inválido. Verifique e tente novamente.");
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setError(""); // Limpa erros ao reenviar
    await sendEmailOTP({ email });
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(""); // Limpa erro ao digitar
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setError(""); // Limpa erros ao colar
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (pastedData.length === 6) {
      setPassword(pastedData);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Digite seu OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            Enviamos um código para{" "}
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
          <p className="caption text-center text-light-200 mt-2">
            Digite o código ou cole (Ctrl+V) diretamente
          </p>
        </AlertDialogHeader>

        <InputOTP 
          maxLength={6} 
          value={password} 
          onChange={handlePasswordChange}
          onPaste={handlePaste}
        >
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
          </InputOTPGroup>
        </InputOTP>

        {error && (
          <div className="error-message mt-2">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
            >
              Enviar
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            <div className="subtitle-2 mt-2 text-center text-light-100">
              Não recebeu um código?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
                onClick={handleResendOtp}
              >
                Clique para reenviar
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
