/**
 * JSON Path utilities for navigating and updating nested brand data
 */

/**
 * Get a value from an object using dot notation path
 * @example getByPath({ color: { brand: { primary: { hex: "#2563EB" } } } }, "color.brand.primary.hex")
 * @returns "#2563EB"
 */
export function getByPath(obj: any, path: string): any {
	if (!path || !obj) return undefined;
	return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Set a value in an object using dot notation path (mutates the object)
 * @example setByPath({}, "color.brand.primary.hex", "#2563EB")
 * @returns { color: { brand: { primary: { hex: "#2563EB" } } } }
 */
export function setByPath(obj: any, path: string, value: any): any {
	if (!path || !obj) return obj;

	const keys = path.split(".");
	const lastKey = keys.pop();
	if (!lastKey) return obj;

	const target = keys.reduce((current, key) => {
		if (current[key] === undefined || current[key] === null) {
			current[key] = {};
		}
		return current[key];
	}, obj);

	target[lastKey] = value;
	return obj;
}

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") return obj;
	if (obj instanceof Date) return new Date(obj.getTime()) as T;
	if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;

	const cloned = {} as T;
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			cloned[key] = deepClone(obj[key]);
		}
	}
	return cloned;
}

/**
 * Merge original data with overrides using dot notation paths
 * @example mergeData(original, { "color.brand.primary.hex": "#1e40af" })
 */
export function mergeData<T>(original: T, overrides: Record<string, any>): T {
	const merged = deepClone(original);

	for (const [path, value] of Object.entries(overrides)) {
		setByPath(merged, path, value);
	}

	return merged;
}

/**
 * Check if a path exists in an object
 */
export function hasPath(obj: any, path: string): boolean {
	if (!path || !obj) return false;

	const keys = path.split(".");
	let current = obj;

	for (const key of keys) {
		if (current === null || current === undefined || !(key in current)) {
			return false;
		}
		current = current[key];
	}

	return true;
}

/**
 * Get all paths in an object (flattened)
 * @example getAllPaths({ color: { brand: { primary: { hex: "#2563EB" } } } })
 * @returns ["color", "color.brand", "color.brand.primary", "color.brand.primary.hex"]
 */
export function getAllPaths(obj: any, prefix = ""): string[] {
	const paths: string[] = [];

	if (obj === null || typeof obj !== "object") {
		return paths;
	}

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const currentPath = prefix ? `${prefix}.${key}` : key;
			paths.push(currentPath);

			if (typeof obj[key] === "object" && obj[key] !== null) {
				paths.push(...getAllPaths(obj[key], currentPath));
			}
		}
	}

	return paths;
}
