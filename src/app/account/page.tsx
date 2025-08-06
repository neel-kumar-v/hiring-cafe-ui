"use client";

import {
  JobTrackingSummary,
  ProfileInformation,
  SavedSearches,
  SkillsSection,
} from "@/components/account";
import { useApp } from "@/contexts/AppContext";
import { CircleUser } from "lucide-react";

export default function AccountPage() {
  const { user, setUser } = useApp();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CircleUser className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Account
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your profile and preferences
          </p>
        </div>

        <div className="space-y-8">
          <ProfileInformation user={user} />
          <SkillsSection user={user} onUserUpdate={setUser} />
          <JobTrackingSummary user={user} />
          <SavedSearches user={user} />
        </div>
      </div>
    </div>
  );
}