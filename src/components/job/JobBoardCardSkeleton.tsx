import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

/** Slim row placeholder matching the scannable List layout. */
export const JobBoardListRowSkeleton = () => {
  return (
    <Card className="border bg-background shadow-sm dark:border-primary/20 dark:bg-card">
      <CardContent className="flex flex-col gap-2.5 p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-14 shrink-0 rounded-[6px]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div>
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="mt-1 h-3.5 w-1/4 [animation-delay:60ms]" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-20 rounded-md [animation-delay:120ms]" />
                <Skeleton className="h-5 w-16 rounded-md [animation-delay:160ms]" />
                <Skeleton className="h-5 w-16 rounded-md [animation-delay:200ms]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-md [animation-delay:240ms]" />
                <Skeleton className="h-4 w-16 [animation-delay:280ms]" />
              </div>
            </div>
            <div className="flex gap-1 pt-0.5">
              <Skeleton className="h-5 w-14 rounded-md [animation-delay:320ms]" />
              <Skeleton className="h-5 w-16 rounded-md [animation-delay:360ms]" />
              <Skeleton className="h-5 w-12 rounded-md [animation-delay:400ms]" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Skeleton className="h-4 w-28 [animation-delay:440ms]" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Skeleton className="h-8 w-24 rounded-md [animation-delay:480ms]" />
            <Skeleton className="h-8 w-16 rounded-md [animation-delay:520ms]" />
            <Skeleton className="size-8 rounded-md [animation-delay:560ms]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const JobBoardCardSkeleton = () => {
  return (
    <Card className="h-full border bg-background shadow-sm dark:border-primary/20 dark:bg-card">
      <CardContent className="flex flex-1 flex-col p-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="-translate-y-2 h-4 w-1/12" />
        </div>
        <div className="mb-2 flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className={`h-4 w-1/6 [animation-delay:${index * 100}ms]`} key={index} />
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
          {Array.from({ length: 2 }).map((_, index) => (
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
