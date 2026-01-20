"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for persisting state to localStorage with SSR support
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
	// Use the server-safe value on the first render to prevent hydration mismatch.
	const [storedValue, setStoredValue] = useState<T>(initialValue);

	// Return a wrapped version of useState's setter function that
	// persists the new value to localStorage.
	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				// Allow value to be a function so we have same API as useState
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;

				// Save state
				setStoredValue(valueToStore);

				// Save to local storage
				if (typeof window !== "undefined") {
					window.localStorage.setItem(key, JSON.stringify(valueToStore));
				}
			} catch (error) {
				console.error(`Error setting localStorage key "${key}":`, error);
			}
		},
		[key, storedValue],
	);

	// Load from localStorage after mount so the initial render matches the server.
	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			const item = window.localStorage.getItem(key);
			if (item) {
				setStoredValue(JSON.parse(item));
			}
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
		}
	}, [key]);

	// Listen for changes to this key from other tabs/windows
	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue !== null) {
				try {
					setStoredValue(JSON.parse(e.newValue));
				} catch (error) {
					console.error("Error parsing storage event value:", error);
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key]);

	return [storedValue, setValue];
}
