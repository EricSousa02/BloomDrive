"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OtpModal from "@/components/OTPModal";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z
      .string({ required_error: "E-mail é obrigatório" })
      .min(1, "E-mail é obrigatório")
      .email("Digite um e-mail válido")
      .max(100, "E-mail deve ter no máximo 100 caracteres")
      .refine(
        (email) => !email.includes(" "),
        "E-mail não pode conter espaços"
      )
      .refine(
        (email) => email.toLowerCase() === email,
        "E-mail deve estar em letras minúsculas"
      ),
    fullName:
      formType === "sign-up"
        ? z
            .string({ required_error: "Nome é obrigatório" })
            .min(2, "Nome deve ter pelo menos 2 caracteres")
            .max(50, "Nome deve ter no máximo 50 caracteres")
            .refine(
              (name) => name.trim().length >= 2,
              "Nome não pode conter apenas espaços"
            )
            .refine(
              (name) => /^[a-zA-ZÀ-ÿ\s]+$/.test(name),
              "Nome deve conter apenas letras e espaços"
            )
            .refine(
              (name) => !name.includes("  "),
              "Nome não pode ter espaços duplos"
            )
        : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Validação adicional antes do envio
      const trimmedValues = {
        email: values.email.trim().toLowerCase(),
        fullName: values.fullName?.trim().replace(/\s+/g, " "), // Remove espaços extras
      };

      // Revalidação com Zod após limpeza
      const validationResult = formSchema.safeParse(trimmedValues);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        setErrorMessage(firstError.message);
        return;
      }

      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: trimmedValues.fullName || "",
              email: trimmedValues.email,
            })
          : await signInUser({ email: trimmedValues.email });

      if (user?.error) {
        setErrorMessage(user.error);
        return;
      }

      if (user?.accountId) {
        setAccountId(user.accountId);
      } else {
        setErrorMessage("Falha ao processar solicitação. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no formulário:", error);
      if (error instanceof z.ZodError) {
        setErrorMessage(error.errors[0].message);
      } else {
        setErrorMessage("Falha ao realizar a operação. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === "sign-in" ? "Entrar" : "Cadastrar"}
          </h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Nome</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Digite seu nome (ex: João)"
                        className="shad-input"
                        {...field}
                        onChange={(e) => {
                          // Remove caracteres especiais e números em tempo real
                          const cleanValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
                          field.onChange(cleanValue);
                        }}
                        onBlur={(e) => {
                          // Limpa espaços extras ao sair do campo
                          const trimmedValue = e.target.value.trim().replace(/\s+/g, " ");
                          field.onChange(trimmedValue);
                        }}
                      />
                    </FormControl>
                  </div>

                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Digite seu e-mail (ex: usuario@exemplo.com)"
                      className="shad-input"
                      type="email"
                      autoComplete="email"
                      {...field}
                      onChange={(e) => {
                        // Remove espaços e converte para minúscula em tempo real
                        const cleanValue = e.target.value.replace(/\s/g, "").toLowerCase();
                        field.onChange(cleanValue);
                      }}
                    />
                  </FormControl>
                </div>

                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading || !form.formState.isValid}
          >
            {type === "sign-in" ? "Entrar" : "Cadastrar"}

            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>

          {errorMessage && (
            <div className="error-message flex items-center gap-2">
              {errorMessage}
            </div>
          )}

          {/* Indicador de validade do formulário */}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="caption text-red-500 text-center">
              Por favor, corrija os erros acima para continuar
            </div>
          )}

          <div className="body-2 flex justify-center">
            <p className="text-light-100 dark:text-light-300">
              {type === "sign-in"
                ? "Não tem uma conta?"
                : "Já tem uma conta?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-1 font-medium text-brand dark:text-brand-dark"
            >
              {" "}
              {type === "sign-in" ? "Cadastrar" : "Entrar"}
            </Link>
          </div>
        </form>
      </Form>

      {accountId && (
        <OtpModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
};

export default AuthForm;
