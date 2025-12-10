"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTagsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  error?: boolean;
}

const CategoryTagsSelector = ({
  value = [],
  onChange,
  placeholder = "Type and press Enter to add...",
  maxTags = 5,
  className,
  error = false,
}: CategoryTagsSelectorProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      !value.some((tag) => tag.toLowerCase() === trimmedValue.toLowerCase()) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "," || e.key === "Tab") {
      if (inputValue.trim()) {
        e.preventDefault();
        handleAddTag();
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemove(value[value.length - 1]);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const isMaxReached = value.length >= maxTags;

  return (
    <div
      onClick={handleContainerClick}
      className={cn(
        "flex flex-wrap items-center gap-2 px-3 py-2 min-h-[52px] w-full rounded-md border border-input bg-white text-sm shadow-xs transition-[color,box-shadow] outline-none cursor-text",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
        className
      )}
    >
      {/* Tags */}
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(tag);
            }}
            className="p-0.5 rounded-full hover:bg-blue-200 transition-colors"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}

      {/* Input */}
      {!isMaxReached && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAddTag}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
        />
      )}

      {/* Max reached message */}
      {isMaxReached && value.length > 0 && (
        <span className="text-xs text-muted-foreground">
          Max {maxTags} tags
        </span>
      )}
    </div>
  );
};

export default CategoryTagsSelector;
