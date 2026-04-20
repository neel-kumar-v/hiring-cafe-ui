import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { User } from "@/types/app";

interface JobTrackingSummaryProps {
  user: User;
}

export default function JobTrackingSummary({ user }: JobTrackingSummaryProps) {
  return (
    <div className="bg-background dark:bg-card rounded-lg border border-border dark:border-border p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground dark:text-foreground">
          Job Tracking Summary
        </h2>
        <Link
          href="/tracker"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300"
        >
          Go to Tracker
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.saved.length}
          </div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            Saved
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.applied.length}
          </div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            Applied
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.interviewing.length}
          </div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            Interviewing
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.rejected.length}
          </div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            Rejected
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.hidden.length}
          </div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            Hidden
          </div>
        </div>
      </div>
    </div>
  );
} 