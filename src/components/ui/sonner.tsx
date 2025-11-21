"use client"

import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, CircleNotchIcon } from "@phosphor-icons/react/dist/ssr"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "rounded-lg p-4 backdrop-blur-lg shadow-2xl",
          title: "font-medium text-base",
          description: "text-sm opacity-90",
          actionButton: "bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700",
          cancelButton: "bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-200",
          error: "!bg-red-50 !text-red-900",
          success: "!bg-green-50 !text-green-900",
          warning: "!bg-yellow-50 !text-yellow-900",
          info: "!bg-blue-50 !text-blue-900",
        },
      }}
      icons={{
        success: <CheckCircleIcon size={24} weight="duotone" className="text-green-600 mr-1" />,
        info: <InfoIcon size={24} weight="duotone" className="text-blue-600 mr-1" />,
        warning: <WarningIcon size={24} weight="duotone" className="text-yellow-600 mr-1" />,
        error: <XCircleIcon size={24} weight="duotone" className="text-destructive" />,
        loading: <CircleNotchIcon size={24} weight="duotone" className="animate-spin text-blue-600 mr-1" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
