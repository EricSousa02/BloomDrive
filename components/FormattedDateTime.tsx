"use client";

import React, { useEffect, useState } from "react";
import { cn, formatDateTime } from "@/lib/utils";

export const FormattedDateTime = ({
  date,
  className,
}: {
  date: string;
  className?: string;
}) => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // Formata a data apenas no cliente para evitar problemas de hidratação
    setFormattedDate(formatDateTime(date));
  }, [date]);

  return (
    <p className={cn("body-1 text-light-200", className)}>
      {formattedDate || "—"}
    </p>
  );
};
export default FormattedDateTime;
