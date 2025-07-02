"use client";

import { XIcon } from "lucide-react";
import {
	AnimatePresence,
	MotionConfig,
	motion,
	type Transition,
	type Variant,
} from "motion/react";
import React, {
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

export type MorphingDialogContextType = {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	uniqueId: string;
	triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MorphingDialogContext =
	React.createContext<MorphingDialogContextType | null>(null);

function useMorphingDialog() {
	const context = useContext(MorphingDialogContext);
	if (!context) {
		throw new Error(
			"useMorphingDialog must be used within a MorphingDialogProvider"
		);
	}
	return context;
}

function useMorphingDialogSafe() {
	return useContext(MorphingDialogContext);
}

export type MorphingDialogProviderProps = {
	children: React.ReactNode;
	transition?: Transition;
};

function MorphingDialogProvider({
	children,
	transition,
}: MorphingDialogProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const uniqueId = useId();
	const triggerRef = useRef<HTMLButtonElement>(null!);

	const contextValue = useMemo(
		() => ({
			isOpen,
			setIsOpen,
			uniqueId,
			triggerRef,
		}),
		[isOpen, uniqueId]
	);

	return (
		<MorphingDialogContext.Provider value={contextValue}>
			<MotionConfig transition={transition}>{children}</MotionConfig>
		</MorphingDialogContext.Provider>
	);
}

export type MorphingDialogProps = {
	children: React.ReactNode;
	transition?: Transition;
};

function MorphingDialog({ children, transition }: MorphingDialogProps) {
	return (
		<MorphingDialogProvider>
			<MotionConfig transition={transition}>{children}</MotionConfig>
		</MorphingDialogProvider>
	);
}

export type MorphingDialogTriggerProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	triggerRef?: React.RefObject<HTMLButtonElement>;
};

function MorphingDialogTrigger({
	children,
	className,
	style,
	triggerRef,
}: MorphingDialogTriggerProps) {
	const { setIsOpen, isOpen, uniqueId } = useMorphingDialog();

	const handleClick = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen, setIsOpen]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				setIsOpen(!isOpen);
			}
		},
		[isOpen, setIsOpen]
	);

	return (
		<motion.button
			aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
			aria-expanded={isOpen}
			aria-haspopup="dialog"
			aria-label={`Open dialog ${uniqueId}`}
			className={cn("relative cursor-pointer", className)}
			layoutId={`dialog-${uniqueId}`}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			ref={triggerRef}
			style={style}
		>
			{children}
		</motion.button>
	);
}

export type MorphingDialogContentProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

function MorphingDialogContent({
	children,
	className,
	style,
}: MorphingDialogContentProps) {
	const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
	const containerRef = useRef<HTMLDivElement>(null!);
	const [firstFocusableElement, setFirstFocusableElement] =
		useState<HTMLElement | null>(null);
	const [lastFocusableElement, setLastFocusableElement] =
		useState<HTMLElement | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
			if (event.key === "Tab") {
				if (!(firstFocusableElement && lastFocusableElement)) return;

				if (event.shiftKey) {
					if (document.activeElement === firstFocusableElement) {
						event.preventDefault();
						lastFocusableElement.focus();
					}
				} else if (document.activeElement === lastFocusableElement) {
					event.preventDefault();
					firstFocusableElement.focus();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [setIsOpen, firstFocusableElement, lastFocusableElement]);

	useEffect(() => {
		if (isOpen) {
			document.body.classList.add("overflow-hidden");
			const focusableElements = containerRef.current?.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (focusableElements && focusableElements.length > 0) {
				setFirstFocusableElement(focusableElements[0] as HTMLElement);
				setLastFocusableElement(
					focusableElements[focusableElements.length - 1] as HTMLElement
				);
				(focusableElements[0] as HTMLElement).focus();
			}
		} else {
			document.body.classList.remove("overflow-hidden");
			triggerRef.current?.focus();
		}
	}, [isOpen, triggerRef]);

	useClickOutside(containerRef, () => {
		if (isOpen) {
			setIsOpen(false);
		}
	});

	return (
		<motion.div
			aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
			aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
			aria-modal="true"
			className={cn("overflow-hidden", className)}
			layoutId={`dialog-${uniqueId}`}
			ref={containerRef}
			role="dialog"
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingDialogContainerProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
	const { isOpen, uniqueId } = useMorphingDialog();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence initial={false} mode="sync">
			{isOpen && (
				<>
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 h-full w-full bg-white/40 backdrop-blur-xs dark:bg-black/40"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						key={`backdrop-${uniqueId}`}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						{children}
					</div>
				</>
			)}
		</AnimatePresence>,
		document.body
	);
}

export type MorphingDialogImageProps = {
	src: string;
	alt: string;
	className?: string;
	style?: React.CSSProperties;
};

function MorphingDialogImage({
	src,
	alt,
	className,
	style,
}: MorphingDialogImageProps) {
	const { uniqueId } = useMorphingDialog();

	return (
		<motion.img
			alt={alt}
			className={cn(className)}
			layoutId={`dialog-img-${uniqueId}`}
			src={src}
			style={style}
		/>
	);
}

// Custom morphing components for job cards
export type MorphingJobTitleProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingJobTitle({
	children,
	className,
	style,
}: MorphingJobTitleProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-title-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingLocationProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingLocation({
	children,
	className,
	style,
}: MorphingLocationProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-location-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingSalaryProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingSalary({
	children,
	className,
	style,
}: MorphingSalaryProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-salary-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingCompanyLogoProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingCompanyLogo({
	children,
	className,
	style,
}: MorphingCompanyLogoProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`company-logo-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingTimeProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingTime({
	children,
	className,
	style,
}: MorphingTimeProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-time-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingCompanyNameProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingCompanyName({
	children,
	className,
	style,
}: MorphingCompanyNameProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`company-name-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingJobDescriptionProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingJobDescription({
	children,
	className,
	style,
}: MorphingJobDescriptionProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-description-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingJobTechnicalToolsProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingJobTechnicalTools({
	children,
	className,
	style,
}: MorphingJobTechnicalToolsProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-technical-tools-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingJobStatsProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingJobStats({
	children,
	className,
	style,
}: MorphingJobStatsProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-stats-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingCommitmentsProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingCommitments({
	children,
	className,
	style,
}: MorphingCommitmentsProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.div
			className={className}
			layout
			layoutId={`job-commitments-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.div>
	);
}

export type MorphingWorkTypeProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingWorkType({
	children,
	className,
	style,
}: MorphingWorkTypeProps) {
	const context = useMorphingDialogSafe();
	if (!context) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}
	const { uniqueId } = context;
	return (
		<motion.span
			className={className}
			layout
			layoutId={`job-work-type-${uniqueId}`}
			style={style}
		>
			{children}
		</motion.span>
	);
}

export type MorphingDialogCloseProps = {
	children?: React.ReactNode;
	className?: string;
	variants?: {
		initial: Variant;
		animate: Variant;
		exit: Variant;
	};
};

function MorphingDialogClose({
	children,
	className,
	variants,
}: MorphingDialogCloseProps) {
	const { setIsOpen, uniqueId } = useMorphingDialog();

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	return (
		<motion.button
			animate="animate"
			aria-label="Close dialog"
			className={cn(
				"absolute top-6 right-6 z-30 rounded-full p-2 transition-colors duration-300 ease-in-out hover:bg-black/20 dark:hover:bg-white/20",
				className
			)}
			exit="exit"
			initial="initial"
			key={`dialog-close-${uniqueId}`}
			onClick={handleClose}
			type="button"
			variants={variants}
		>
			{children || <XIcon size={24} />}
		</motion.button>
	);
}

export {
	MorphingDialog,
	MorphingDialogTrigger,
	MorphingDialogContainer,
	MorphingDialogContent,
	MorphingDialogClose,
	MorphingDialogImage,
};
