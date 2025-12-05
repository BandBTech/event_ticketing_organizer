"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { publicServices } from "@/services/publicServices";
import { Check, ChevronsUpDown, Plus, X, Loader2 } from "lucide-react";

interface CategoryTagsSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	maxTags?: number;
	className?: string;
}

const CategoryTagsSelector = ({
	value = [],
	onChange,
	placeholder = "Select or type categories...",
	maxTags = 5,
	className,
}: CategoryTagsSelectorProps) => {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch categories from API
	const { data: categoriesData, isLoading, isError } = useQuery({
		queryKey: ["categories"],
		queryFn: () => publicServices.getCategories(),
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
	});

	const categories = Array.isArray(categoriesData) ? categoriesData : [];

	const categoryNames = categories.map((cat) => cat.name);

	const filteredSuggestions = categoryNames.filter(
		(category) =>
			!value.includes(category) &&
			category.toLowerCase().includes(inputValue.toLowerCase())
	);

	const handleSelect = (category: string) => {
		if (!value.includes(category) && value.length < maxTags) {
			onChange([...value, category]);
			setInputValue("");
		}
	};

	const handleRemove = (category: string) => {
		onChange(value.filter((tag) => tag !== category));
	};

	const handleCreateNew = () => {
		const trimmedValue = inputValue.trim();
		if (
			trimmedValue &&
			!value.includes(trimmedValue) &&
			value.length < maxTags
		) {
			onChange([...value, trimmedValue]);
			setInputValue("");
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const trimmedValue = inputValue.trim();

			// Check if it matches an existing suggestion
			const matchedSuggestion = filteredSuggestions.find(
				(s) => s.toLowerCase() === trimmedValue.toLowerCase()
			);

			if (matchedSuggestion) {
				handleSelect(matchedSuggestion);
			} else if (trimmedValue) {
				handleCreateNew();
			}
		} else if (e.key === "Backspace" && !inputValue && value.length > 0) {
			handleRemove(value[value.length - 1]);
		}
	};

	const isMaxReached = value.length >= maxTags;
	const showCreateOption =
		inputValue.trim() &&
		!filteredSuggestions.some(
			(s) => s.toLowerCase() === inputValue.trim().toLowerCase()
		) &&
		!value.some((v) => v.toLowerCase() === inputValue.trim().toLowerCase());

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"w-full min-h-[52px] h-auto justify-between font-normal hover:bg-transparent",
						className
					)}
				>
					<div className="flex flex-wrap items-center gap-1.5 flex-1">
						{value.length > 0 ? (
							<>
								{value.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="px-2 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
									>
										{tag}
										<span
											role="button"
											tabIndex={0}
											onClick={(e) => {
												e.stopPropagation();
												handleRemove(tag);
											}}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.stopPropagation();
													handleRemove(tag);
												}
											}}
											className="ml-1 rounded-full hover:bg-blue-200 p-0.5 transition-colors cursor-pointer"
											aria-label={`Remove ${tag}`}
										>
											<X className="h-3 w-3" />
										</span>
									</Badge>
								))}
								{!isMaxReached && (
									<span className="text-muted-foreground text-sm">
										+ Add more
									</span>
								)}
							</>
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[350px] p-0" align="start">
				<Command>
					<CommandInput
						ref={inputRef}
						placeholder={
							isMaxReached
								? `Max ${maxTags} categories reached`
								: "Search or create category..."
						}
						value={inputValue}
						onValueChange={setInputValue}
						onKeyDown={handleKeyDown}
						disabled={isMaxReached}
					/>
					<CommandList>
						{isLoading ? (
							<div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading categories...
							</div>
						) : isError ? (
							<div className="p-4 text-center text-sm text-destructive">
								Failed to load categories. You can still type custom ones.
							</div>
						) : !isMaxReached ? (
							<>
								{showCreateOption && (
									<CommandGroup>
										<CommandItem
											value={`create-${inputValue}`}
											onSelect={handleCreateNew}
											className="cursor-pointer"
										>
											<Plus className="mr-2 h-4 w-4 text-green-600" />
											<span>
												Create &quot;
												<span className="font-medium">{inputValue.trim()}</span>
												&quot;
											</span>
										</CommandItem>
									</CommandGroup>
								)}

								{filteredSuggestions.length > 0 ? (
									<CommandGroup heading="Categories">
										{filteredSuggestions.map((category) => (
											<CommandItem
												key={category}
												value={category}
												onSelect={() => handleSelect(category)}
												className="cursor-pointer"
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														value.includes(category)
															? "opacity-100"
															: "opacity-0"
													)}
												/>
												{category}
											</CommandItem>
										))}
									</CommandGroup>
								) : (
									!showCreateOption && (
										<CommandEmpty>
											<div className="p-2 text-center text-sm text-muted-foreground">
												{inputValue
													? "No matching categories. Press Enter to create."
													: "All categories selected."}
											</div>
										</CommandEmpty>
									)
								)}
							</>
						) : (
							<div className="p-4 text-center text-sm text-muted-foreground">
								Maximum of {maxTags} categories reached.
								<br />
								Remove a category to add more.
							</div>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default CategoryTagsSelector;
