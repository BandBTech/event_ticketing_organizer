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
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { DateTimeInput } from "@/components/ui/datetime-input";
import TierNameSelector from "./TierNameSelector";
import { TierTemplate } from "@/types/event";
import { EventFormData } from "@/lib/validation";

interface TicketTierCardProps {
	index: number;
	control: Control<EventFormData>;
	tierTemplates: TierTemplate[];
	showDelete: boolean;
	onDelete: () => void;
}

const TicketTierCard = ({
	index,
	control,
	tierTemplates,
	showDelete,
	onDelete,
}: TicketTierCardProps) => {
	return (
		<div className="grid md:grid-cols-3 gap-5 border border-gray-200 rounded-lg p-4 relative">
			<FormField
				control={control}
				name={`tickets.${index}.name`}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="inline-block">Tier Name</FormLabel>
						<FormControl>
							<TierNameSelector
								value={field.value}
								onChange={field.onChange}
								templates={tierTemplates}
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
						<FormLabel className="inline-block">Sales start</FormLabel>
						<FormControl>
							<DateTimePicker
								value={field.value ? new Date(field.value) : undefined}
								onChange={(date) => {
									if (!date) field.onChange("");
									else if (typeof date === "string") field.onChange(date);
									else field.onChange(date.toISOString());
								}}
								use12HourFormat
								timePicker={{
									hour: true,
									minute: true,
								}}
								renderTrigger={({ open, value, setOpen }) => (
									<DateTimeInput
										value={value}
										onChange={(x) =>
											!open && field.onChange(x ? x.toISOString() : "")
										}
										format="dd/MM/yyyy hh:mm aa"
										disabled={open}
										onCalendarClick={() => setOpen(!open)}
										error={!!fieldState.error}
										className="h-13 md:text-md"
									/>
								)}
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
						<FormLabel className="inline-block">Sales ends</FormLabel>
						<FormControl>
							<DateTimePicker
								value={field.value ? new Date(field.value) : undefined}
								onChange={(date) => {
									if (!date) field.onChange("");
									else if (typeof date === "string") field.onChange(date);
									else field.onChange(date.toISOString());
								}}
								use12HourFormat
								timePicker={{
									hour: true,
									minute: true,
								}}
								renderTrigger={({ open, value, setOpen }) => (
									<DateTimeInput
										value={value}
										onChange={(x) =>
											!open && field.onChange(x ? x.toISOString() : "")
										}
										format="dd/MM/yyyy hh:mm aa"
										disabled={open}
										onCalendarClick={() => setOpen(!open)}
										error={!!fieldState.error}
										className="h-13 md:text-md"
									/>
								)}
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
