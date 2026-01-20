import {
	getAllPaths,
	getByPath,
	hasPath,
	mergeData,
	setByPath,
} from "../lib/jsonPathUtils";

describe("jsonPathUtils", () => {
	describe("getByPath", () => {
		it("should retrieve nested property", () => {
			const obj = {
				color: {
					brand: {
						primary: {
							hex: "#2563EB",
						},
					},
				},
			};
			expect(getByPath(obj, "color.brand.primary.hex")).toBe("#2563EB");
		});

		it("should return undefined for non-existent path", () => {
			const obj = { foo: { bar: "baz" } };
			expect(getByPath(obj, "foo.nonexistent")).toBeUndefined();
		});

		it("should handle empty path", () => {
			const obj = { foo: "bar" };
			expect(getByPath(obj, "")).toBeUndefined();
		});

		it("should handle null object", () => {
			expect(getByPath(null, "foo.bar")).toBeUndefined();
		});
	});

	describe("setByPath", () => {
		it("should set nested property", () => {
			const obj = {};
			setByPath(obj, "color.brand.primary.hex", "#1e40af");
			expect(obj).toEqual({
				color: {
					brand: {
						primary: {
							hex: "#1e40af",
						},
					},
				},
			});
		});

		it("should overwrite existing value", () => {
			const obj = {
				color: {
					brand: {
						primary: {
							hex: "#2563EB",
						},
					},
				},
			};
			setByPath(obj, "color.brand.primary.hex", "#1e40af");
			expect(obj.color.brand.primary.hex).toBe("#1e40af");
		});

		it("should create intermediate objects", () => {
			const obj = {};
			setByPath(obj, "a.b.c.d", "value");
			expect(obj).toEqual({
				a: { b: { c: { d: "value" } } },
			});
		});
	});

	describe("mergeData", () => {
		it("should merge overrides into original data", () => {
			const original = {
				color: {
					brand: {
						primary: { hex: "#2563EB" },
						secondary: { hex: "#64748B" },
					},
				},
			};
			const overrides = {
				"color.brand.primary.hex": "#1e40af",
			};
			const merged = mergeData(original, overrides);

			expect(merged.color.brand.primary.hex).toBe("#1e40af");
			expect(merged.color.brand.secondary.hex).toBe("#64748B");
		});

		it("should not mutate original data", () => {
			const original = {
				color: { brand: { primary: { hex: "#2563EB" } } },
			};
			const overrides = { "color.brand.primary.hex": "#1e40af" };

			const merged = mergeData(original, overrides);

			expect(original.color.brand.primary.hex).toBe("#2563EB");
			expect(merged.color.brand.primary.hex).toBe("#1e40af");
		});

		it("should handle multiple overrides", () => {
			const original = {
				a: { b: 1 },
				c: { d: 2 },
			};
			const overrides = {
				"a.b": 10,
				"c.d": 20,
			};
			const merged = mergeData(original, overrides);

			expect(merged.a.b).toBe(10);
			expect(merged.c.d).toBe(20);
		});
	});

	describe("hasPath", () => {
		it("should return true for existing path", () => {
			const obj = { color: { brand: { primary: { hex: "#2563EB" } } } };
			expect(hasPath(obj, "color.brand.primary.hex")).toBe(true);
		});

		it("should return false for non-existent path", () => {
			const obj = { foo: { bar: "baz" } };
			expect(hasPath(obj, "foo.nonexistent")).toBe(false);
		});

		it("should return false for empty path", () => {
			const obj = { foo: "bar" };
			expect(hasPath(obj, "")).toBe(false);
		});
	});

	describe("getAllPaths", () => {
		it("should return all paths in flat structure", () => {
			const obj = {
				color: {
					brand: {
						primary: {
							hex: "#2563EB",
						},
					},
				},
			};
			const paths = getAllPaths(obj);

			expect(paths).toContain("color");
			expect(paths).toContain("color.brand");
			expect(paths).toContain("color.brand.primary");
			expect(paths).toContain("color.brand.primary.hex");
		});

		it("should handle empty object", () => {
			expect(getAllPaths({})).toEqual([]);
		});

		it("should handle null", () => {
			expect(getAllPaths(null)).toEqual([]);
		});
	});
});
