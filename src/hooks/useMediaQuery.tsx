"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const memoizedQuery = useMemo(() => query, [query]);

	const updateMatches = useCallback((media: MediaQueryList) => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		
		timeoutRef.current = setTimeout(() => {
			setMatches(media.matches);
		}, 50);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return;
		}

		const media = window.matchMedia(memoizedQuery);
		
		setMatches(media.matches);

		const listener = (event: MediaQueryListEvent) => {
			updateMatches(event.target as MediaQueryList);
		};

		media.addEventListener("change", listener);
		return () => {
			media.removeEventListener("change", listener);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [memoizedQuery, updateMatches]);

	return matches;
}

export function useResponsiveBreakpoint() {
	const [isDesktop, setIsDesktop] = useState(false);
	const [isStable, setIsStable] = useState(true);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const updateBreakpoint = useCallback((matches: boolean) => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		setIsStable(false);
		
		timeoutRef.current = setTimeout(() => {
			setIsDesktop(matches);
			setIsStable(true);
		}, 100);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return;
		}

		const mediaQuery = window.matchMedia("(min-width: 768px)");
		setIsDesktop(mediaQuery.matches);

		const listener = (event: MediaQueryListEvent) => {
			updateBreakpoint(event.matches);
		};

		mediaQuery.addEventListener("change", listener);
		return () => {
			mediaQuery.removeEventListener("change", listener);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [updateBreakpoint]);

	return { isDesktop, isStable };
}
