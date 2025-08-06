import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { User } from "@/types/app";

interface JobTrackingSummaryProps {
  user: User;
}

export default function JobTrackingSummary({ user }: JobTrackingSummaryProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
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
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Saved
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.applied.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Applied
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.interviewing.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Interviewing
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.rejected.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Rejected
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {user.hidden.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Hidden
          </div>
        </div>
      </div>
    </div>
  );
} 