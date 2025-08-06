import { User } from "@/types/app";

interface ProfileInformationProps {
  user: User;
}

export default function ProfileInformation({ user }: ProfileInformationProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
        Profile Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
            Name
          </label>
          <p className="text-neutral-900 dark:text-white font-medium">
            {user.name}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
            Email
          </label>
          <p className="text-neutral-900 dark:text-white font-medium">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
} 