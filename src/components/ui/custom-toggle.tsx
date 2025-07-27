"use client";

import { Toggle as TogglePrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
	"relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 " +
		// underline effect
		"before:-translate-x-1/2 before:absolute before:bottom-0 before:left-1/2 before:h-[2px] before:w-[15%] before:origin-center before:scale-x-100 before:rounded-full before:bg-pink-500 before:transition-all before:duration-300 before:content-[''] " +
		// hover underline expands to 75%
		"hover:text-inherit hover:before:w-[55%] hover:before:bg-pink-500 hover:before:opacity-100 " +
		// active (clicked/on) underline expands to 85%, no bg
		"data-[state=on]:text-inherit data-[state=on]:before:w-[102%] data-[state=on]:before:bg-pink-500 data-[state=on]:before:opacity-100",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				outline: "border border-input bg-transparent shadow-xs",
			},
			size: {
				default: "h-9 min-w-9 px-2",
				sm: "h-8 min-w-8 px-1.5",
				lg: "h-10 min-w-10 px-2.5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Toggle({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
	VariantProps<typeof toggleVariants>) {
	return (
		<TogglePrimitive.Root
			className={cn(toggleVariants({ variant, size, className }))}
			data-slot="toggle"
			{...props}
		/>
	);
}

export { Toggle, toggleVariants };
