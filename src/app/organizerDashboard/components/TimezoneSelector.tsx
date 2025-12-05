"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimezoneSelectorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

const TIMEZONES = [
	// Americas
	{ value: "America/New_York", label: "(UTC-05:00) Eastern Time - New York" },
	{ value: "America/Chicago", label: "(UTC-06:00) Central Time - Chicago" },
	{ value: "America/Denver", label: "(UTC-07:00) Mountain Time - Denver" },
	{ value: "America/Los_Angeles", label: "(UTC-08:00) Pacific Time - Los Angeles" },
	{ value: "America/Anchorage", label: "(UTC-09:00) Alaska Time" },
	{ value: "Pacific/Honolulu", label: "(UTC-10:00) Hawaii Time" },
	{ value: "America/Toronto", label: "(UTC-05:00) Eastern Time - Toronto" },
	{ value: "America/Vancouver", label: "(UTC-08:00) Pacific Time - Vancouver" },
	{ value: "America/Mexico_City", label: "(UTC-06:00) Central Time - Mexico City" },
	{ value: "America/Sao_Paulo", label: "(UTC-03:00) Brasilia Time" },
	{ value: "America/Buenos_Aires", label: "(UTC-03:00) Argentina Time" },

	// Europe
	{ value: "Europe/London", label: "(UTC+00:00) London - GMT/BST" },
	{ value: "Europe/Paris", label: "(UTC+01:00) Paris - CET" },
	{ value: "Europe/Berlin", label: "(UTC+01:00) Berlin - CET" },
	{ value: "Europe/Amsterdam", label: "(UTC+01:00) Amsterdam - CET" },
	{ value: "Europe/Madrid", label: "(UTC+01:00) Madrid - CET" },
	{ value: "Europe/Rome", label: "(UTC+01:00) Rome - CET" },
	{ value: "Europe/Zurich", label: "(UTC+01:00) Zurich - CET" },
	{ value: "Europe/Moscow", label: "(UTC+03:00) Moscow - MSK" },
	{ value: "Europe/Istanbul", label: "(UTC+03:00) Istanbul - TRT" },

	// Asia
	{ value: "Asia/Kathmandu", label: "(UTC+05:45) Nepal Time - Kathmandu" },
	{ value: "Asia/Kolkata", label: "(UTC+05:30) India Standard Time" },
	{ value: "Asia/Dubai", label: "(UTC+04:00) Gulf Standard Time - Dubai" },
	{ value: "Asia/Singapore", label: "(UTC+08:00) Singapore Time" },
	{ value: "Asia/Hong_Kong", label: "(UTC+08:00) Hong Kong Time" },
	{ value: "Asia/Shanghai", label: "(UTC+08:00) China Standard Time" },
	{ value: "Asia/Tokyo", label: "(UTC+09:00) Japan Standard Time" },
	{ value: "Asia/Seoul", label: "(UTC+09:00) Korea Standard Time" },
	{ value: "Asia/Bangkok", label: "(UTC+07:00) Indochina Time - Bangkok" },
	{ value: "Asia/Jakarta", label: "(UTC+07:00) Western Indonesia Time" },

	// Pacific
	{ value: "Australia/Sydney", label: "(UTC+10:00) Australian Eastern Time - Sydney" },
	{ value: "Australia/Melbourne", label: "(UTC+10:00) Australian Eastern Time - Melbourne" },
	{ value: "Australia/Perth", label: "(UTC+08:00) Australian Western Time - Perth" },
	{ value: "Pacific/Auckland", label: "(UTC+12:00) New Zealand Time" },
	{ value: "Pacific/Fiji", label: "(UTC+12:00) Fiji Time" },

	// Africa & Middle East
	{ value: "Africa/Cairo", label: "(UTC+02:00) Eastern European Time - Cairo" },
	{ value: "Africa/Johannesburg", label: "(UTC+02:00) South Africa Time" },
	{ value: "Africa/Lagos", label: "(UTC+01:00) West Africa Time - Lagos" },
	{ value: "Asia/Jerusalem", label: "(UTC+02:00) Israel Time" },
	{ value: "Asia/Riyadh", label: "(UTC+03:00) Arabia Standard Time" },
];

const TimezoneSelector = ({
	value,
	onChange,
	placeholder = "Select Timezone",
	className,
	disabled = false,
}: TimezoneSelectorProps) => {
	return (
		<Select value={value} onValueChange={onChange} disabled={disabled}>
			<SelectTrigger className={cn("h-13 md:text-md", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="max-h-[300px]">
				{TIMEZONES.map((tz) => (
					<SelectItem key={tz.value} value={tz.value}>
						{tz.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default TimezoneSelector;
export { TIMEZONES };
