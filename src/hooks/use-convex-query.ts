"use client";

import { useCallback, useEffect } from "react";
import { useMutation, usePaginatedQuery_experimental, useQuery_experimental } from "convex/react";
import { useConvexBackendHealth } from "@/components/convex-backend-health";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";

type ConvexQuery = FunctionReference<"query">;
type ConvexMutation = FunctionReference<"mutation">;

export type ConvexQueryState<T> = { status: "pending" } | { status: "success"; data: T } | { status: "error"; error: Error };

/** Convex `useQuery` that never throws — returns `undefined` while loading or on failure. */
export function useConvexQuery<Query extends ConvexQuery>(query: Query, args?: FunctionArgs<Query> | "skip"): FunctionReturnType<Query> | undefined {
  const state = useConvexQueryState(query, args);
  if (state.status === "success") {
    return state.data;
  }
  return undefined;
}

/** Full status for fallbacks and outage UI. */
export function useConvexQueryState<Query extends ConvexQuery>(query: Query, args?: FunctionArgs<Query> | "skip"): ConvexQueryState<FunctionReturnType<Query>> {
  const { reportQueryError } = useConvexBackendHealth();
  const queryArgs = (args ?? {}) as FunctionArgs<Query> | "skip";
  const result = useQuery_experimental({
    query,
    args: queryArgs,
    throwOnError: false,
  });

  useEffect(() => {
    if (result.status === "error") {
      reportQueryError(result.error);
    }
  }, [reportQueryError, result.status, result.status === "error" ? result.error.message : ""]);

  if (result.status === "success") {
    return { status: "success", data: result.data };
  }
  if (result.status === "error") {
    return { status: "error", error: result.error };
  }
  return { status: "pending" };
}

/** Convex `useMutation` that reports failures to backend health without crashing unhandled callers. */
export function useConvexMutation<Mutation extends ConvexMutation>(mutation: Mutation) {
  const { reportQueryError } = useConvexBackendHealth();
  const mutate = useMutation(mutation);

  return useCallback(
    async (...args: Parameters<typeof mutate>) => {
      try {
        return await mutate(...args);
      } catch (error) {
        if (error instanceof Error) {
          reportQueryError(error);
        }
        throw error;
      }
    },
    [mutate, reportQueryError]
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPaginatedQuery = FunctionReference<"query", "public", any, any>;

/** Convex `usePaginatedQuery` that never throws — returns empty results and stops pagination on outage. */
export function useConvexPaginatedQuery<Query extends AnyPaginatedQuery>(
  query: Query,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any,
  options: { initialNumItems: number }
) {
  const { reportQueryError } = useConvexBackendHealth();
  const result = usePaginatedQuery_experimental({
    query,
    args,
    initialNumItems: options.initialNumItems,
    throwOnError: false,
  });

  useEffect(() => {
    if (result.status === "error" && result.error) {
      reportQueryError(result.error);
    }
  }, [reportQueryError, result.status, result.status === "error" ? result.error?.message : ""]);

  if (result.status === "error") {
    return {
      results: [] as unknown[],
      status: "Exhausted" as const,
      loadMore: (_numItems: number) => {},
      isLoading: false,
    };
  }

  if (result.status === "pending") {
    return {
      results: (result.data ?? []) as unknown[],
      status: "LoadingFirstPage" as const,
      loadMore: result.loadMore,
      isLoading: true,
    };
  }

  return {
    results: (result.data ?? []) as unknown[],
    status: result.canLoadMore ? ("CanLoadMore" as const) : ("Exhausted" as const),
    loadMore: result.loadMore,
    isLoading: result.isLoading,
  };
}

// Drop-in alias names matching useSafeConvex:
export const useSafeQuery = useConvexQuery;
export const useSafeMutation = useConvexMutation;
export const useSafePaginatedQuery = useConvexPaginatedQuery;
