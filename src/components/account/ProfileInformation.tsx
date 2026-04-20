import { User } from "@/types/app";

interface ProfileInformationProps {
  user: User;
}

export default function ProfileInformation({ user }: ProfileInformationProps) {
  return (
    <div className="bg-background dark:bg-card rounded-lg border border-border dark:border-border p-6">
      <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">
        Profile Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-foreground/80 dark:text-foreground/80 mb-2 block">
            Name
          </label>
          <p className="text-foreground dark:text-foreground font-medium">
            {user.name}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/80 dark:text-foreground/80 mb-2 block">
            Email
          </label>
          <p className="text-foreground dark:text-foreground font-medium">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
} 