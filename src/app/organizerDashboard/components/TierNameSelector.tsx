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
}: TierNameSelectorProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-13 justify-between font-normal md:text-md hover:bg-transparent",
            error && "border-red-500 focus:ring-red-500/20"
          )}
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || t("event.placeholder.selectTier", "Select or type tier name...")}
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
            placeholder={t("event.placeholder.searchTier", "Search or create tier...")}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("event.text.noTierFound", "No tier found.")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onChange(inputValue);
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("event.button.create", "Create")} &quot;{inputValue}&quot;
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="create-new-tier-option"
                onSelect={() => {
                  setOpen(false);
                  onCreateNew?.();
                }}
                className="text-blue-600 font-medium cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("event.button.createNewTier", "Create New Tier")}
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading={t("event.section.templates", "Templates")}>
              {templates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.template_name}
                  onSelect={() => {
                    onChange(template.template_name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === template.template_name
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {template.template_name}
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
