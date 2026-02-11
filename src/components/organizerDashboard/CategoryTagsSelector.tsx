"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface CategoryTagsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxChars?: number;
  className?: string;
  error?: boolean;
}

const CategoryTagsSelector = ({
  value = [],
  onChange,
  placeholder,
  maxTags = 5,
  maxChars = 50,
  className,
  error = false,
}: CategoryTagsSelectorProps) => {
  const { t } = useTranslation();
  const defaultPlaceholder = t("event.placeholder.tags", "Type and press Enter/Comma to add...");
  const effectivePlaceholder = placeholder || defaultPlaceholder;

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (value.length < maxTags) {
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemove = (tagToRemove: string, indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Tab") {
      if (inputValue.trim()) {
        e.preventDefault();
        handleAddTag();
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemove(value[value.length - 1], value.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue.endsWith(",")) {
      const tagValue = newValue.slice(0, -1).trim();

      if (!tagValue) {
        setInputValue("");
        return;
      }

      const isMaxTagsReached = value.length >= maxTags;

      if (!isMaxReached) {
        onChange([...value, tagValue]);
        setInputValue("");
      } else {
        setInputValue(tagValue);
      }
      return;
    }

    if (newValue.length <= maxChars) {
      setInputValue(newValue);
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
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 break-all whitespace-normal max-w-full"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(tag, index);
            }}
            className="p-0.5 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}

      {!isMaxReached && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleAddTag}
          placeholder={value.length === 0 ? effectivePlaceholder : t("event.placeholder.addMore", "Add more...")}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
        />
      )}
    </div>
  );
};

export default CategoryTagsSelector;
