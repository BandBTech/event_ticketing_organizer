"use client";

import { cn } from "@/lib/utils";

interface HtmlRendererProps {
  html: string;
  className?: string;
}

/**
 * HtmlRenderer component - Renders HTML content from the RTE editor
 * with proper styling to match the editor's output format.
 * 
 * This component sanitizes and renders HTML content with consistent
 * typography styles for headings, paragraphs, lists, links, etc.
 */
export function HtmlRenderer({ html, className }: HtmlRendererProps) {
  if (!html || html.trim() === "" || html === "<p><br></p>") {
    return (
      <p className="text-muted-foreground italic">No description provided.</p>
    );
  }

  return (
    <div
      className={cn(
        // Base prose styles
        "prose prose-gray max-w-none",
        // Headings
        "prose-headings:text-gray-900 prose-headings:font-semibold",
        "prose-h1:text-2xl prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:mb-3",
        "prose-h3:text-lg prose-h3:mb-2",
        // Paragraphs
        "prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-3",
        // Lists
        "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-3",
        "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-3",
        "prose-li:text-gray-600 prose-li:mb-1",
        // Links
        "prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700",
        // Strong/Bold
        "prose-strong:text-gray-900 prose-strong:font-semibold",
        // Emphasis/Italic
        "prose-em:italic",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-gray-300",
        "prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600",
        // Code
        "prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
        // Custom className
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default HtmlRenderer;
