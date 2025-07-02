import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDarkMode } from "@/contexts/DarkModeContext";

// Custom debounce hook
function useDebounce(value: string, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export default function DateRangePopover() {
	const { isDarkMode } = useDarkMode();
	const [customTimeValue, setCustomTimeValue] = useState("3");
	const [customTimeUnit, setCustomTimeUnit] = useState("days");
	const [isAllTime, setIsAllTime] = useState(false);

	const debouncedTimeValue = useDebounce(customTimeValue, 500);

	const getTimeUnitLimits = (unit: string) => {
		const limits: { [key: string]: { min: number; max: number } } = {
			hours: { min: 1, max: 24 },
			days: { min: 1, max: 7 },
			weeks: { min: 1, max: 3 },
			months: { min: 1, max: 11 },
			years: { min: 1, max: 10 },
		};
		return limits[unit] || { min: 1, max: 100 };
	};

	const handleNumberChange = (value: string) => {
		const numValue = Number.parseInt(value) || 0;
		const limits = getTimeUnitLimits(customTimeUnit);

		if (numValue < limits.min) {
			setCustomTimeValue(limits.min.toString());
		} else if (numValue > limits.max) {
			setCustomTimeValue(limits.max.toString());
		} else {
			setCustomTimeValue(value);
		}
	};

	const handleTimeUnitChangeWithValidation = (unit: string) => {
		if (unit === "all-time") {
			setIsAllTime(true);
			setCustomTimeUnit("days");
			return;
		}

		setIsAllTime(false);
		setCustomTimeUnit(unit);

		const defaults: { [key: string]: string } = {
			hours: "24",
			days: "3",
			weeks: "2",
			months: "1",
			years: "1",
		};

		const currentValue = Number.parseInt(customTimeValue) || 0;
		const newLimits = getTimeUnitLimits(unit);

		if (currentValue >= newLimits.min && currentValue <= newLimits.max) {
		} else {
			setCustomTimeValue(defaults[unit] || "1");
		}
	};

	useEffect(() => {
		if (debouncedTimeValue && customTimeUnit) {
			console.log(`Time filter: ${debouncedTimeValue} ${customTimeUnit}`);
		}
	}, [debouncedTimeValue, customTimeUnit]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className="w-fit rounded bg-white text-gray-900 text-sm dark:bg-gray-800 dark:text-white"
					variant="outline"
				>
					{isAllTime ? "All time" : `${customTimeValue} ${customTimeUnit}`}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={`dark:border-gray-600 dark:bg-gray-800 ${
					isDarkMode ? "dark" : ""
				}`}
			>
				<div className="flex items-center space-x-2">
					<Input
						className="w-12 border-gray-200 bg-white text-center text-gray-900 text-sm ring-0 [-moz-appearance:textfield] dark:border-gray-600 dark:bg-gray-700 dark:text-white [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
						disabled={isAllTime}
						max={getTimeUnitLimits(customTimeUnit).max}
						min={getTimeUnitLimits(customTimeUnit).min}
						onChange={(e) => handleNumberChange(e.target.value)}
						placeholder="Enter number"
						type="number"
						value={customTimeValue}
					/>
					<Select
						onValueChange={handleTimeUnitChangeWithValidation}
						value={isAllTime ? "all-time" : customTimeUnit}
					>
						<SelectTrigger className="w-24 border-gray-200 bg-white text-gray-900 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className={isDarkMode ? "dark" : ""}>
							<SelectItem value="all-time">All time</SelectItem>
							<SelectItem value="hours">Hours</SelectItem>
							<SelectItem value="days">Days</SelectItem>
							<SelectItem value="weeks">Weeks</SelectItem>
							<SelectItem value="months">Months</SelectItem>
							<SelectItem value="years">Years</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</PopoverContent>
		</Popover>
	);
}
