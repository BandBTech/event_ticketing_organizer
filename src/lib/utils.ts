import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to "MM/DD/YYYY h:mm AM/PM" format
 * @param date - Date object, ISO string, or timestamp
 * @param options - Optional formatting options
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  options?: {
    includeSeconds?: boolean;
    timezone?: string;
  }
): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(options?.includeSeconds && { second: "2-digit" }),
      ...(options?.timezone && { timeZone: options.timezone }),
    };

    return dateObj.toLocaleString("en-US", formatOptions);
  } catch {
    return "";
  }
}

/**
 * Format a date to "MM/DD/YYYY" format (date only)
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Format a date to "h:mm AM/PM" format (time only)
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted time string or empty string if invalid
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param date - Date object, ISO string, or timestamp
 * @returns Relative time string or empty string if invalid
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffDay) >= 1) {
      return rtf.format(diffDay, "day");
    } else if (Math.abs(diffHour) >= 1) {
      return rtf.format(diffHour, "hour");
    } else if (Math.abs(diffMin) >= 1) {
      return rtf.format(diffMin, "minute");
    } else {
      return rtf.format(diffSec, "second");
    }
  } catch {
    return "";
  }
}
