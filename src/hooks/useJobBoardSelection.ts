"use client";

import { selectRangeIds } from "@/lib/jobs/selection";
import { useCallback, useEffect, useRef, useState } from "react";

type UseJobBoardSelectionOptions = {
  orderedIds: string[];
  selectionMode: boolean;
  setSelectionMode: (enabled: boolean) => void;
  onOpen: (jobId: string) => void;
};

/**
 * Owns the keyboard/range-selection policy for browse surfaces.
 *
 * Keeping this policy out of the board renderer gives list, board, and future
 * virtualized renderers the same interaction semantics without duplicating
 * event handling.
 */
export function useJobBoardSelection({ orderedIds, selectionMode, setSelectionMode, onOpen }: UseJobBoardSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const hadSelectionRef = useRef(false);

  const clear = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setAnchorId(null);
  }, [setSelectionMode]);

  const toggle = useCallback((jobId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  const handleCardClick = useCallback(
    (event: React.MouseEvent, jobId: string) => {
      const hasModifier = event.shiftKey || event.ctrlKey || event.metaKey;
      if (hasModifier && !selectionMode) {
        setSelectionMode(true);
        setSelectedIds(new Set([jobId]));
        setAnchorId(jobId);
        return;
      }

      if (!selectionMode) {
        onOpen(jobId);
        return;
      }

      if (event.shiftKey) {
        const range = selectRangeIds(
          orderedIds.map((id) => ({ id })),
          anchorId ?? jobId,
          jobId
        );
        setSelectedIds((previous) => new Set([...previous, ...range]));
        if (!anchorId) setAnchorId(jobId);
        return;
      }

      toggle(jobId);
      if (!anchorId) setAnchorId(jobId);
    },
    [anchorId, onOpen, orderedIds, selectionMode, setSelectionMode, toggle]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectionMode) clear();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clear, selectionMode]);

  useEffect(() => {
    if (!selectionMode) {
      hadSelectionRef.current = false;
      setSelectedIds((previous) => (previous.size === 0 ? previous : new Set()));
      setAnchorId(null);
      return;
    }

    if (selectedIds.size > 0) {
      hadSelectionRef.current = true;
      return;
    }

    // Shift/ctrl selection always starts with a job. Empty mode is valid when
    // the user entered it from the Select jobs button — don't bounce them out.
    if (hadSelectionRef.current) clear();
  }, [clear, selectedIds.size, selectionMode]);

  return {
    selectedIds,
    anchorId,
    clear,
    handleCardClick,
  };
}
