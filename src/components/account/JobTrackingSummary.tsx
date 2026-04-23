import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { User } from "@/types/app";

interface JobTrackingSummaryProps {
  user: User;
}

export default function JobTrackingSummary({ user }: JobTrackingSummaryProps) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">
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
          <div className="text-2xl font-bold text-foreground">
            {user.saved.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Saved
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {user.applied.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Applied
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {user.interviewing.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Interviewing
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {user.rejected.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Rejected
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {user.hidden.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Hidden
          </div>
        </div>
      </div>
    </div>
  );
} 
