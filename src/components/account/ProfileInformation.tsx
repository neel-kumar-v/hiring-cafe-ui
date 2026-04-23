import { User } from "@/types/app";

interface ProfileInformationProps {
  user: User;
}

export default function ProfileInformation({ user }: ProfileInformationProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        Profile Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/80">
            Name
          </label>
          <p className="font-medium text-foreground">
            {user.name}
          </p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/80">
            Email
          </label>
          <p className="font-medium text-foreground">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
} 
