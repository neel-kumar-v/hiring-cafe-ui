import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const JobBoardCardSkeleton = () => {
  const randomTagCount = Math.floor(Math.random() * 4) + 1;
  const randomJobLines = Math.floor(Math.random() * 3);
  return (
    <Card className="bg-white h-full dark:bg-gray-800 border dark:border-pink-700/20 shadow-sm">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/12 -translate-y-2" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: randomTagCount }).map((_, index) => (
            <Skeleton
              key={index}
              className={`h-4 w-1/6 [animation-delay:${index * 100}ms]`}
            />
          ))}
        </div>
        <div className="flex items-center mb-3">
          <Skeleton className="size-14 rounded-md mr-3" />
          <div className="flex-1">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-3 w-3/4 mb-1 [animation-delay:100ms]" />
            <Skeleton className="h-3 w-1/2 mb-1 [animation-delay:150ms]" />
          </div>
        </div>
        <div className="flex-1">
          {Array.from({ length: randomJobLines }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-4/5 mb-2" />
          ))}
          <div className="flex flex-wrap gap-1 mb-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20 [animation-delay:100ms]" />
            <Skeleton className="h-5 w-14 [animation-delay:200ms]" />
            <Skeleton className="h-5 w-18 [animation-delay:300ms]" />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center mt-auto">
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
          <div className="flex justify-center items-center space-x-1">
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
