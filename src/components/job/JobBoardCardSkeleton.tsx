import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const JobBoardCardSkeleton = () => {
	const [randomTagCount, setRandomTagCount] = useState(2); // Default fallback
	const [randomJobLines, setRandomJobLines] = useState(1); // Default fallback

	useEffect(() => {
		setRandomTagCount(Math.floor(Math.random() * 4) + 1);
		setRandomJobLines(Math.floor(Math.random() * 3));
	}, []);

	return (
		<Card className="h-full border bg-white shadow-sm dark:border-pink-700/20 dark:bg-gray-800">
			<CardContent className="flex h-full flex-col p-4 py-3">
				<div className="mb-2 flex items-center justify-between">
					<Skeleton className="h-8 w-3/4" />
					<Skeleton className="-translate-y-2 h-4 w-1/12" />
				</div>
				<div className="mb-2 flex items-center gap-2">
					{Array.from({ length: randomTagCount }).map((_, index) => (
						<Skeleton
							className={`h-4 w-1/6 [animation-delay:${index * 100}ms]`}
							key={index}
						/>
					))}
				</div>
				<div className="mb-3 flex items-center">
					<Skeleton className="mr-3 size-14 rounded-md" />
					<div className="flex-1">
						<Skeleton className="mb-2 h-6 w-2/3" />
						<Skeleton className="mb-1 h-3 w-3/4 [animation-delay:100ms]" />
						<Skeleton className="mb-1 h-3 w-1/2 [animation-delay:150ms]" />
					</div>
				</div>
				<div className="flex-1">
					{Array.from({ length: randomJobLines }).map((_, index) => (
						<Skeleton className="mb-2 h-4 w-4/5" key={index} />
					))}
					<div className="mb-3 flex flex-wrap gap-1">
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-5 w-20 [animation-delay:100ms]" />
						<Skeleton className="h-5 w-14 [animation-delay:200ms]" />
						<Skeleton className="h-5 w-18 [animation-delay:300ms]" />
					</div>
				</div>
				<div className="mt-auto grid grid-cols-3 items-center">
					<div className="flex items-center space-x-2">
						<div className="flex items-center space-x-1">
							<Skeleton className="size-3" />
							<Skeleton className="size-3" />
						</div>
						<div className="flex items-center space-x-1">
							<Skeleton className="size-3" />
							<Skeleton className="size-3" />
						</div>
						<div className="flex items-center space-x-1">
							<Skeleton className="size-3" />
							<Skeleton className="size-3" />
						</div>
					</div>
					<div className="flex items-center justify-center space-x-1">
						<Skeleton className="size-4 rounded-full" />
						<Skeleton className="size-2 rounded-full [animation-delay:100ms]" />
						<Skeleton className="size-2 rounded-full [animation-delay:200ms]" />
						<Skeleton className="size-2 rounded-full [animation-delay:300ms]" />
						<Skeleton className="size-2 rounded-full [animation-delay:400ms]" />
						<Skeleton className="size-4 rounded-full" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default JobBoardCardSkeleton;
