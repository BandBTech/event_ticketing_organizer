"use client";

import { Control, FieldErrors } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { ShadcnDateTimePicker } from "@/components/ui/shadcn-datetime-picker";
import TierNameSelector from "./TierNameSelector";
import { TierTemplate } from "@/types/event";
import { EventFormData } from "@/lib/validation";

interface TicketTierCardProps {
	index: number;
	control: Control<EventFormData>;
	tierTemplates: TierTemplate[];
	showDelete: boolean;
	onDelete: () => void;
  onCreateNew: () => void;
}

const TicketTierCard = ({
	index,
	control,
	tierTemplates,
	showDelete,
	onDelete,
  onCreateNew,
}: TicketTierCardProps) => {
	return (
		<div className="grid md:grid-cols-3 gap-5 border border-gray-200 rounded-lg p-4 relative">
			<FormField
				control={control}
				name={`tickets.${index}.name`}
        render={({ field, fieldState }) => (
					<FormItem>
						<FormLabel className="inline-block">Tier Name</FormLabel>
						<FormControl>
							<TierNameSelector
								value={field.value}
								onChange={field.onChange}
								templates={tierTemplates}
                error={!!fieldState.error}
                onCreateNew={onCreateNew}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`tickets.${index}.price`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">Price</FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								type="number"
								placeholder="e.g. 100"
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
				name={`tickets.${index}.quantity`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">Quantity</FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								type="number"
								placeholder="Enter number of quantity"
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
				name={`tickets.${index}.gst`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">GST(%)</FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								type="number"
								placeholder="Enter GST in percentage"
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
				name={`tickets.${index}.salesStart`}
				render={({ field, fieldState }) => (
					<FormItem>
            <FormLabel className="inline-block">Sales Start Date</FormLabel>
						<FormControl>
              <ShadcnDateTimePicker
                value={field.value ? new Date(field.value) : null}
								onChange={(date) => {
                  if (!date) field.onChange("");
									else field.onChange(date.toISOString());
								}}
                format="yyyy-mm-dd hh:mm aa"
                clearable
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`tickets.${index}.salesEnd`}
				render={({ field, fieldState }) => (
					<FormItem>
            <FormLabel className="inline-block">Sales End Date</FormLabel>
						<FormControl>
              <ShadcnDateTimePicker
                value={field.value ? new Date(field.value) : null}
								onChange={(date) => {
                  if (!date) field.onChange("");
									else field.onChange(date.toISOString());
								}}
                format="yyyy-mm-dd hh:mm aa"
                clearable
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{showDelete && (
				<Trash2
					onClick={onDelete}
					className="absolute right-4 top-4 text-red-400 w-5 h-5 hover:bg-red-200 cursor-pointer"
				/>
			)}
		</div>
	);
};

export default TicketTierCard;
