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


export function LinkLoader({ 
  href, 
  children, 
  isLoading = false, 
  loadingText = "Loading...",
  className = "",
  onClick
}: LinkLoaderProps) {
  if (isLoading) {
    return (
      <span className={`inline-flex items-center gap-2 text-blue-600 opacity-50 cursor-not-allowed ${className}`}>
        <Loader size="sm" text={loadingText} />
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