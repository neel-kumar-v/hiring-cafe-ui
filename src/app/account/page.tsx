"use client";

import { JobTrackingSummary, ProfileInformation, SavedSearches, SkillsSection } from "@/components/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CircleUser } from "lucide-react";
import { useState } from "react";

export default function AccountPage() {
  const { user, setUser } = useApp();
  const { email, user: convexUser, isLoading, login, logout } = useCurrentUser();
  const [loginEmail, setLoginEmail] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CircleUser className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Account</h1>
          </div>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">Signed in (local dev)</div>
                <div className="text-sm text-muted-foreground">{isLoading ? "Loading…" : email ? `Email: ${email}` : "Not signed in"}</div>
                {convexUser && <div className="text-xs text-muted-foreground">Convex user id: {String(convexUser._id)}</div>}
              </div>

              {email ? (
                <Button type="button" variant="outline" onClick={logout}>
                  Sign out
                </Button>
              ) : (
                <form
                  className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void login(loginEmail);
                  }}
                >
                  <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" type="email" className="sm:w-64" />
                  <Button type="submit" disabled={!loginEmail.trim()}>
                    Sign in
                  </Button>
                </form>
              )}
            </div>
          </div>

          <ProfileInformation user={user} />
          <SkillsSection user={user} onUserUpdate={setUser} />
          <JobTrackingSummary user={user} />
          <SavedSearches />
        </div>
      </div>
    </div>
  );
}
