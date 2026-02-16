"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { SpinnerIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useCallback } from 'react';

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
}

interface LinkLoaderProps {
  href: string;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
}

export default function Loader({size = "md", text, className =""}: LoaderProps){
    const sizeClasses = {
        sm: "w-4 h-4",
         md: "w-6 h-6",
          lg: "w-8 h-8",
    };

    return(
        <div className={`flex items-center justify-center gap-2 ${className}`}>
        <SpinnerIcon className={`animate-spin ${sizeClasses[size]}`} />
        {text && <span className="text-sm">{text}</span>}
        </div>
    );
}

interface ButtonLoaderProps {
  loadingText?: string;
}

export function ButtonLoader({ loadingText = "Loading..." }: ButtonLoaderProps) {
  return <Loader size="sm" text={loadingText} />;
}

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
    toggleLoading
  };
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t("common.loading", text)}</p>
      </div>
    </div>
  );
}


export function LinkLoader({ 
  href, 
  children, 
  isLoading = false, 
  className = "",
  onClick
}: LinkLoaderProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  if (isLoading) {
    return (
      <span className={`inline-flex items-center gap-2 text-blue-600 opacity-50 cursor-not-allowed ${className}`}>
        <Loader size="sm" text={t("common.loading", "Loading...")} />
      </span>
    );
  }

  return (
    <Link 
      href={href} 
      className={`text-blue-600 hover:underline ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}