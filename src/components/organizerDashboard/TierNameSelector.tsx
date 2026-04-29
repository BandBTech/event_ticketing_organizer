"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TierTemplate } from "@/services/tierService";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { TIER_NAME_MAX } from "@/lib/validation";

import { useTranslation } from "@/hooks/useTranslation";

interface TierNameSelectorProps {
  value: string;
  onChange: (val: string) => void;
  templates: TierTemplate[];
  error?: boolean;
  onCreateNew?: () => void;
  isLoading?: boolean;
}

const TierNameSelector = ({
  value,
  onChange,
  templates,
  error = false,
  onCreateNew,
  isLoading = false,
  usedTierNames = [],
}: TierNameSelectorProps & { usedTierNames?: string[] }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const filteredTemplates = templates
    .filter(
      (t) =>
        !usedTierNames.includes(t.template_name) || t.template_name === value,
    )
    .sort((a, b) => a.template_name.localeCompare(b.template_name));

  const isNameUsed = usedTierNames.includes(inputValue) && inputValue !== value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-13 justify-between font-normal md:text-md hover:bg-transparent",
            error && "border-red-500 focus:ring-red-500/20",
          )}
        >
          <span
            className={cn(
              "truncate flex-1 text-left",
              !value && "text-muted-foreground",
            )}
          >
            {value ||
              t("event.placeholder.selectTier", "Select or type tier name...")}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={t(
              "event.placeholder.searchTier",
              "Search or create tier...",
            )}
            onValueChange={setInputValue}
            maxLength={TIER_NAME_MAX}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-4 text-sm text-muted-foreground text-center">
                {t("event.text.noTierFound", "No tier found.")}
              </div>
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="create-new-tier-option"
                disabled={isNameUsed}
                onSelect={() => {
                  if (!isNameUsed) {
                    setOpen(false);
                    onCreateNew?.();
                  }
                }}
                className={cn(
                  "font-medium cursor-pointer",
                  isNameUsed
                    ? "opacity-50 cursor-not-allowed"
                    : "text-blue-600",
                )}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isNameUsed
                  ? t("event.text.tierNameUsed", "Name already used")
                  : t("event.button.createNewTier", "Create New Tier")}
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading={t("event.section.templates", "Templates")}>
              {filteredTemplates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.template_name}
                  onSelect={() => {
                    onChange(template.template_name);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === template.template_name
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="truncate flex-1 text-left">
                    {template.template_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TierNameSelector;
