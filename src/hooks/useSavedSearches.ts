"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

export function useSavedSearches() {
  const { user: convexUser, email } = useCurrentUser();
  const savedSearches = useQuery(api.savedSearches.listByUser, convexUser ? { userId: convexUser._id } : "skip");
  const createSavedSearch = useMutation(api.savedSearches.create);
  const renameSavedSearch = useMutation(api.savedSearches.rename);
  const removeSavedSearch = useMutation(api.savedSearches.remove);

  const rename = async (id: Id<"savedSearches">, name: string) => {
    if (!convexUser) {
      toast.error("Sign in first to rename searches.");
      return;
    }
    try {
      await renameSavedSearch({ id, userId: convexUser._id, name: name.trim() || "Untitled" });
    } catch (error) {
      console.error("Failed to rename saved search:", error);
      toast.error("Couldn't rename saved search.");
      throw error;
    }
  };

  const remove = async (id: Id<"savedSearches">) => {
    if (!convexUser) {
      toast.error("Sign in first to delete searches.");
      return;
    }
    try {
      await removeSavedSearch({ id, userId: convexUser._id });
      toast.success("Deleted saved search.");
    } catch (error) {
      console.error("Failed to delete saved search:", error);
      toast.error("Couldn't delete saved search.");
      throw error;
    }
  };

  const create = async (name: string, searchState: unknown) => {
    if (!convexUser) {
      toast.error("Sign in first to save searches.");
      return null;
    }
    try {
      const newId = await createSavedSearch({
        userId: convexUser._id,
        name,
        searchState,
      });
      toast.success("Search saved successfully!");
      return newId;
    } catch (error) {
      console.error("Failed to save search:", error);
      toast.error("Couldn't save search.");
      throw error;
    }
  };

  return {
    convexUser,
    email,
    savedSearches,
    create,
    rename,
    remove,
  };
}
