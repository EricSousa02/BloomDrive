"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-brand",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Carregando"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

/**
 * Skeleton loader para cards
 */
export function CardSkeleton() {
  return (
    <div className="file-card cursor-default animate-pulse">
      <div className="flex justify-between">
        <div className="w-20 h-20 bg-gray-200 rounded" />
        <div className="flex flex-col items-end justify-between">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-12 h-4 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full h-5 bg-gray-200 rounded" />
        <div className="w-24 h-4 bg-gray-200 rounded" />
        <div className="w-32 h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader para navegação
 */
export function NavSkeleton() {
  return (
    <div className="flex items-center gap-4 h-[52px] px-6">
      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
