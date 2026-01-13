"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

/**
 * TranslatedFormMessage - Displays form error messages with dynamic translation
 * 
 * Error messages in Zod schemas should be stored as translation keys (e.g., "auth.validation.emailRequired")
 * This component translates them at render time, ensuring messages update when locale changes.
 * 
 * Supports placeholder substitution with params encoded in the message:
 * - Format: "translation.key|param1:value1,param2:value2"
 * - Example: "event.validation.tierNameLength|max:100" 
 * - This translates the key and replaces {max} with "100"
 * 
 * Usage:
 * 1. In Zod schema: z.string().max(100, "event.validation.maxLength|max:100")
 * 2. In component: <TranslatedFormMessage t={t} />
 */
interface TranslatedFormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Translation function from useTranslation hook */
  t: (key: string, fallback?: string) => string
  /** Fallback text if translation key is not found */
  fallback?: string
}

/**
 * Parses a message key that may contain embedded params.
 * Format: "translation.key|param1:value1,param2:value2"
 * Returns: { key: "translation.key", params: { param1: "value1", param2: "value2" } }
 */
const parseMessageWithParams = (message: string): { key: string; params: Record<string, string> } => {
  const pipeIndex = message.indexOf('|')
  if (pipeIndex === -1) {
    return { key: message, params: {} }
  }

  const key = message.substring(0, pipeIndex)
  const paramsString = message.substring(pipeIndex + 1)
  const params: Record<string, string> = {}

  // Parse "param1:value1,param2:value2" format
  paramsString.split(',').forEach(pair => {
    const colonIndex = pair.indexOf(':')
    if (colonIndex !== -1) {
      const paramKey = pair.substring(0, colonIndex).trim()
      const paramValue = pair.substring(colonIndex + 1).trim()
      params[paramKey] = paramValue
    }
  })

  return { key, params }
}

/**
 * Substitutes {placeholder} tokens in a string with values from params object.
 */
const substitutePlaceholders = (text: string, params: Record<string, string>): string => {
  let result = text
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  })
  return result
}

const TranslatedFormMessage = React.forwardRef<
  HTMLParagraphElement,
  TranslatedFormMessageProps
>(({ className, t, fallback, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()

  // If no error and no children, render nothing
  if (!error && !children) {
    return null
  }

  // Get the message - either from error or children
  let body: React.ReactNode
  if (error?.message) {
    const rawMessage = String(error.message)

    // Check if it looks like a translation key (contains dots)
    if (rawMessage.includes('.')) {
      // Parse the message for embedded params (format: "key|param1:value1,param2:value2")
      const { key, params } = parseMessageWithParams(rawMessage)

      // Translate the key
      let translated = t(key, fallback || key)

      // Substitute any placeholders with params
      if (Object.keys(params).length > 0) {
        translated = substitutePlaceholders(translated, params)
      }

      body = translated
    } else {
      // Not a translation key, use as-is
      body = rawMessage
    }
  } else {
    body = children
  }

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
TranslatedFormMessage.displayName = "TranslatedFormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  TranslatedFormMessage,
  FormField,
}
