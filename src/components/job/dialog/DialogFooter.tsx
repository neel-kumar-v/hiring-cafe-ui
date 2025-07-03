import {
	Bookmark,
	BookUser,
	CheckCheck,
	ExternalLink,
	EyeOff,
	Link2,
	MessageSquareWarning,
	Send,
	Share2,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

const DialogFooter = ({
	isBookmarked,
	isApplied,
	onBookmarkToggle,
	onApplyToggle,
	applyUrl,
}: {
	isBookmarked: boolean;
	isApplied: boolean;
	onBookmarkToggle: () => void;
	onApplyToggle: () => void;
	applyUrl: string;
}) => {
	return (
		<div className="sticky right-0 bottom-0 left-0 border-gray-200 border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
			<DialogActionButtons
				isApplied={isApplied}
				isBookmarked={isBookmarked}
				onApplyToggle={onApplyToggle}
				onBookmarkToggle={onBookmarkToggle}
				applyUrl={applyUrl}
			/>
		</div>
	);
};

export const DialogActionButtons = ({
	onBookmarkToggle,
	isBookmarked,
	onApplyToggle,
	isApplied,
	applyUrl,
}: {
	onBookmarkToggle: () => void;
	isBookmarked: boolean;
	onApplyToggle: () => void;
	isApplied: boolean;
	applyUrl: string;
}) => {
	return (
		<div className="flex flex-wrap items-center justify-center gap-3 ">
			<Button
				className="flex items-center gap-2"
				onClick={onBookmarkToggle}
				size="sm"
				variant="outline"
			>
				<Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
				{isBookmarked ? "Saved" : "Save"}
			</Button>

			<a
				href={applyUrl}
				className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-pink-500 text-pink-700 hover:border-pink-600 hover:bg-pink-600 hover:text-white dark:border-pink-400 dark:text-pink-400 dark:hover:border-pink-800 dark:hover:bg-pink-800 dark:hover:text-white px-3 py-2 h-9 gap-2"
				tabIndex={0}
				role="button"
			>
				<Send className="h-4 w-4" />
				Apply Now
			</a>

			<Button
				className="flex items-center gap-2"
				onClick={onApplyToggle}
				size="sm"
				variant="outline"
			>
				<CheckCheck className={`h-4 w-4 ${isApplied ? "fill-current" : ""}`} />
				{isApplied ? "Applied" : "Mark Applied"}
			</Button>

			<div className="mx-1 min-h-[2rem] w-px bg-border align-self-stretch" />

			<Button
				className="flex items-center gap-2 max-sm:hidden"
				size="sm"
				variant="outline"
			>
				<BookUser className="h-4 w-4" />
				Contact Recruiter
			</Button>

			<Button className="flex items-center gap-2" size="sm" variant="outline">
				<Share2 className="h-4 w-4" />
				Share
			</Button>

			<Button className="flex items-center gap-2" size="sm" variant="outline">
				<Link2 className="h-4 w-4" />
				Company Site
			</Button>

			<Button className="flex items-center gap-2" size="sm" variant="outline">
				<ExternalLink className="h-4 w-4" />
				All Jobs
			</Button>

			<div className="mx-1 min-h-[2rem] w-px bg-border align-self-stretch max-sm:hidden" />

			<Button
				className="flex items-center gap-2 max-sm:hidden"
				size="sm"
				variant="outline"
			>
				<EyeOff className="h-4 w-4" />
				Hide
			</Button>

			<Button
				className="flex items-center gap-2 max-sm:hidden"
				size="sm"
				variant="outline"
			>
				<MessageSquareWarning className="h-4 w-4" />
				Report
			</Button>
		</div>
	);
};

export default DialogFooter;
