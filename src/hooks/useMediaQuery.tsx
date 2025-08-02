"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
		const media = window.matchMedia(memoizedQuery);
		
		if (media.matches !== matches) {
			setMatches(media.matches);
		}

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
	}, [memoizedQuery, matches, updateMatches]);

	return matches;
}

export function useResponsiveBreakpoint() {
	const [isDesktop, setIsDesktop] = useState(false);
	const [isStable, setIsStable] = useState(true);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const mediaQuery = useMemo(() => window.matchMedia("(min-width: 768px)"), []);

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
	}, [mediaQuery, updateBreakpoint]);

	return { isDesktop, isStable };
}
