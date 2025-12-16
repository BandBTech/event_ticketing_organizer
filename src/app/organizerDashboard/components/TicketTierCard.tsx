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
import { useTranslation } from "@/hooks/useTranslation";

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
	const { t } = useTranslation();

	return (
		<div className="grid md:grid-cols-3 gap-5 border border-gray-200 rounded-lg p-4 relative">
			<FormField
				control={control}
				name={`tickets.${index}.name`}
				render={({ field, fieldState }) => (
					<FormItem>
						<FormLabel className="inline-block">{t("event.field.tierName", "Tier Name")} <span className="text-red-500">*</span></FormLabel>
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
						<FormLabel className="inline-block">{t("event.field.ticketPrice", "Price")} <span className="text-red-500">*</span></FormLabel>
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
						<FormLabel className="inline-block">{t("event.field.ticketQuantity", "Quantity")} <span className="text-red-500">*</span></FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								type="number"
								placeholder={t("event.placeholder.quantity", "Enter number of quantity")}
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
						<FormLabel className="inline-block">{t("event.field.gst", "GST(%)")} <span className="text-red-500">*</span></FormLabel>
						<FormControl>
							<Input
								className="h-13 md:text-md"
								type="number"
								placeholder={t("event.placeholder.gst", "Enter GST in percentage")}
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
						<FormLabel className="inline-block">{t("event.field.salesStart", "Sales Start Date")} <span className="text-red-500">*</span></FormLabel>
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
						<FormLabel className="inline-block">{t("event.field.salesEnd", "Sales End Date")} <span className="text-red-500">*</span></FormLabel>
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
