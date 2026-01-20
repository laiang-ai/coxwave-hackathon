"use client";

import { useCallback, useMemo } from "react";
import { mergeData } from "../lib/jsonPathUtils";
import type { BrandType } from "../types";
import { useLocalStorage } from "./useLocalStorage";

export type BrandOverrides = Record<string, any>;

export interface UseBrandDataReturn {
	/** Original immutable brand data */
	originalData: BrandType;
	/** User overrides from localStorage */
	overrides: BrandOverrides;
	/** Merged data (original + overrides) */
	mergedData: BrandType;
	/** Apply an update to a specific path */
	applyUpdate: (path: string, value: any) => void;
	/** Reset a specific property to original value */
	resetProperty: (path: string) => void;
	/** Reset all overrides */
	resetAll: () => void;
	/** Check if a property has been modified */
	isModified: (path: string) => boolean;
	/** Get the number of modifications */
	modificationCount: number;
}

/**
 * Hook for managing brand data with localStorage persistence
 */
export function useBrandData(originalData: BrandType): UseBrandDataReturn {
	const [overrides, setOverrides] = useLocalStorage<BrandOverrides>(
		"brand-overrides",
		{},
	);

	// Compute merged data (original + overrides)
	const mergedData = useMemo(
		() => mergeData(originalData, overrides),
		[originalData, overrides],
	);

	// Apply an update to a specific path
	const applyUpdate = useCallback(
		(path: string, value: any) => {
			setOverrides((prev) => ({
				...prev,
				[path]: value,
			}));
		},
		[setOverrides],
	);

	// Reset a specific property
	const resetProperty = useCallback(
		(path: string) => {
			setOverrides((prev) => {
				const next = { ...prev };
				delete next[path];
				return next;
			});
		},
		[setOverrides],
	);

	// Reset all overrides
	const resetAll = useCallback(() => {
		setOverrides({});
	}, [setOverrides]);

	// Check if a property is modified
	const isModified = useCallback(
		(path: string) => {
			return path in overrides;
		},
		[overrides],
	);

	// Count modifications
	const modificationCount = useMemo(
		() => Object.keys(overrides).length,
		[overrides],
	);

	return {
		originalData,
		overrides,
		mergedData,
		applyUpdate,
		resetProperty,
		resetAll,
		isModified,
		modificationCount,
	};
}
