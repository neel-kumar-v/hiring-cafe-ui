"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface DarkModeContextType {
	isDarkMode: boolean;
	setIsDarkMode: (darkMode: boolean) => void;
	toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
	undefined
);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
	const [isDarkMode, setIsDarkMode] = useState(false);

	// Initialize dark mode from localStorage on mount
	useEffect(() => {
		const savedDarkMode = localStorage.getItem("darkMode");
		if (savedDarkMode !== null) {
			setIsDarkMode(JSON.parse(savedDarkMode));
		}
	}, []);

	// Update localStorage and document class when dark mode changes
	useEffect(() => {
		localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
		if (isDarkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDarkMode]);

	const toggleDarkMode = () => {
		setIsDarkMode((prev) => !prev);
	};

	return (
		<DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleDarkMode }}>
			{children}
		</DarkModeContext.Provider>
	);
}

export function useDarkMode() {
	const context = useContext(DarkModeContext);
	if (context === undefined) {
		throw new Error("useDarkMode must be used within a DarkModeProvider");
	}
	return context;
}
