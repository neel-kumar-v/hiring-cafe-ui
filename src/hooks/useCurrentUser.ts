"use client";

import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthEmail, setAuthEmail } from "@/lib/local-auth";

export function useCurrentUser() {
	const [email, setEmail] = useState<string | null>(null);

	useEffect(() => {
		setEmail(getAuthEmail());
	}, []);

	const ensureByEmail = useMutation(api.users.ensureByEmail);
	const user = useQuery(api.users.getByEmail, email ? { email } : "skip");

	const login = useCallback(
		async (nextEmail: string, name?: string) => {
			const trimmed = nextEmail.trim();
			if (!trimmed) return;
			setAuthEmail(trimmed);
			setEmail(trimmed);
			// Ensure a user record exists. Query will subsequently resolve.
			await ensureByEmail({ email: trimmed, name });
		},
		[ensureByEmail]
	);

	const logout = useCallback(() => {
		setAuthEmail(null);
		setEmail(null);
	}, []);

	return useMemo(
		() => ({
			email,
			user: user ?? null,
			isLoading: email !== null && user === undefined,
			login,
			logout,
		}),
		[email, user, login, logout]
	);
}

