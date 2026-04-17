const AUTH_EMAIL_KEY = "hiring-cafe-auth-email";
const AUTH_CHANGED_EVENT = "hiringcafe:auth-changed";

export function getAuthEmail(): string | null {
	if (typeof window === "undefined") return null;
	const email = window.localStorage.getItem(AUTH_EMAIL_KEY);
	return email?.trim() ? email.trim() : null;
}

export function setAuthEmail(email: string | null) {
	if (typeof window === "undefined") return;
	if (!email) {
		window.localStorage.removeItem(AUTH_EMAIL_KEY);
		window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
		return;
	}
	window.localStorage.setItem(AUTH_EMAIL_KEY, email.trim());
	window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function onAuthChanged(handler: () => void) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(AUTH_CHANGED_EVENT, handler);
	return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler);
}

