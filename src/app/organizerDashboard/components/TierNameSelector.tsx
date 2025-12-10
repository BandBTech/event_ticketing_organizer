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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

interface TierNameSelectorProps {
  value: string;
  onChange: (val: string) => void;
  templates: TierTemplate[];
  error?: boolean;
}

const TierNameSelector = ({
  value,
  onChange,
  templates,
  error = false,
}: TierNameSelectorProps) => {
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
            {value || "Select or type tier name..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create tier..."
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2">
                <p className="text-sm text-muted-foreground mb-2">
                  No tier found.
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
                  Create &quot;{inputValue}&quot;
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Templates">
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
