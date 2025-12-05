"use client";

import { Control } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { EventFormData } from "@/lib/validation";

interface PromoCodeCardProps {
	index: number;
	control: Control<EventFormData>;
	onDelete: () => void;
}

const PromoCodeCard = ({ index, control, onDelete }: PromoCodeCardProps) => {
	return (
		<div className="grid md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4 relative">
			<FormField
				control={control}
				name={`promoCodes.${index}.code`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">Promo code</FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								placeholder="e.g EARLYBIRD"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`promoCodes.${index}.discountType`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">Discount Type</FormLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<FormControl>
								<SelectTrigger className="h-13 md:text-md">
									<SelectValue placeholder="Select Type" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="amount">Amount (Fixed)</SelectItem>
								<SelectItem value="percentage">Percentage (%)</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`promoCodes.${index}.amount`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">Amount</FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								type="number"
								placeholder="500"
								{...field}
								onChange={(e) => field.onChange(e.target.valueAsNumber)}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`promoCodes.${index}.quantity`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">Quantity</FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								type="number"
								placeholder="500"
								{...field}
								onChange={(e) => field.onChange(e.target.valueAsNumber)}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<Trash2
				onClick={onDelete}
				className="absolute right-4 top-4 text-red-400 w-5 h-5 p-1 rounded-md hover:bg-red-200 cursor-pointer"
			/>
		</div>
	);
};

export default PromoCodeCard;
