import { tool } from "@openai/agents";
import { z } from "zod";

/**
 * 브랜드 속성 업데이트 도구
 * Brand Editor가 사용자 요청에 따라 브랜드 속성을 수정할 때 사용
 */
const updateBrandPropertyTool = tool({
	name: "update_brand_property",
	description:
		"Update a specific brand property value. Use this when the user wants to change any brand attribute like colors, fonts, mission, etc. Returns the suggested change for user confirmation.",
	parameters: z.object({
		path: z
			.string()
			.describe(
				'JSON path to the property (e.g., "color.brand.primary.hex", "brandOverview.mission")',
			),
		newValue: z
			.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
			.describe("The new value to set"),
		reason: z
			.string()
			.describe("Explanation of why this change is recommended"),
	}),
	execute: async ({ path, newValue, reason }) => {
		// 이 도구는 에이전트가 제안을 생성하는 데 사용됨
		// 실제 업데이트는 클라이언트에서 처리
		return JSON.stringify({
			action: "update_property",
			path,
			newValue,
			reason,
			status: "suggested",
			message: `속성 "${path}"를 "${newValue}"로 변경하는 것을 제안합니다. 이유: ${reason}`,
		});
	},
});

/**
 * 색상 조정 제안 도구
 * 현재 색상을 기반으로 밝게/어둡게/채도 조정 등을 제안
 */
const suggestColorAdjustmentTool = tool({
	name: "suggest_color_adjustment",
	description:
		"Suggest color adjustments (lighter, darker, more saturated, etc.) based on design principles. Use when user asks to modify colors without specifying exact values.",
	parameters: z.object({
		currentColor: z
			.string()
			.describe("Current color in HEX format (e.g., #FF5733)"),
		adjustment: z
			.enum([
				"lighter",
				"darker",
				"more_saturated",
				"less_saturated",
				"warmer",
				"cooler",
				"complementary",
			])
			.describe("Type of adjustment to apply"),
		intensity: z
			.enum(["subtle", "moderate", "strong"])
			.default("moderate")
			.describe("How much to adjust the color"),
	}),
	execute: async ({ currentColor, adjustment, intensity }) => {
		// HEX를 RGB로 변환
		const hex = currentColor.replace("#", "");
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		// 조정 강도
		const intensityMap = { subtle: 0.1, moderate: 0.25, strong: 0.4 };
		const factor = intensityMap[intensity];

		let newR = r,
			newG = g,
			newB = b;

		switch (adjustment) {
			case "lighter":
				newR = Math.min(255, Math.round(r + (255 - r) * factor));
				newG = Math.min(255, Math.round(g + (255 - g) * factor));
				newB = Math.min(255, Math.round(b + (255 - b) * factor));
				break;
			case "darker":
				newR = Math.max(0, Math.round(r * (1 - factor)));
				newG = Math.max(0, Math.round(g * (1 - factor)));
				newB = Math.max(0, Math.round(b * (1 - factor)));
				break;
			case "more_saturated": {
				const max = Math.max(r, g, b);
				const min = Math.min(r, g, b);
				const mid = (max + min) / 2;
				newR = Math.round(r + (r > mid ? 1 : -1) * Math.abs(r - mid) * factor);
				newG = Math.round(g + (g > mid ? 1 : -1) * Math.abs(g - mid) * factor);
				newB = Math.round(b + (b > mid ? 1 : -1) * Math.abs(b - mid) * factor);
				newR = Math.max(0, Math.min(255, newR));
				newG = Math.max(0, Math.min(255, newG));
				newB = Math.max(0, Math.min(255, newB));
				break;
			}
			case "less_saturated": {
				const avg = (r + g + b) / 3;
				newR = Math.round(r + (avg - r) * factor);
				newG = Math.round(g + (avg - g) * factor);
				newB = Math.round(b + (avg - b) * factor);
				break;
			}
			case "warmer":
				newR = Math.min(255, Math.round(r * (1 + factor * 0.5)));
				newB = Math.max(0, Math.round(b * (1 - factor * 0.5)));
				break;
			case "cooler":
				newR = Math.max(0, Math.round(r * (1 - factor * 0.5)));
				newB = Math.min(255, Math.round(b * (1 + factor * 0.5)));
				break;
			case "complementary":
				newR = 255 - r;
				newG = 255 - g;
				newB = 255 - b;
				break;
		}

		const newHex =
			`#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`.toUpperCase();

		return JSON.stringify({
			action: "color_suggestion",
			originalColor: currentColor,
			suggestedColor: newHex,
			adjustment,
			intensity,
			message: `"${currentColor}"를 ${adjustment} (${intensity}) 조정하여 "${newHex}"를 제안합니다.`,
		});
	},
});

/**
 * 접근성 대비 검사 도구
 * 두 색상 간의 WCAG 대비율을 계산
 */
const checkContrastRatioTool = tool({
	name: "check_contrast_ratio",
	description:
		"Check the WCAG contrast ratio between two colors to ensure accessibility compliance.",
	parameters: z.object({
		foreground: z.string().describe("Foreground color in HEX format"),
		background: z.string().describe("Background color in HEX format"),
	}),
	execute: async ({ foreground, background }) => {
		// 상대 휘도 계산
		const getLuminance = (hex: string) => {
			const rgb = hex
				.replace("#", "")
				.match(/.{2}/g)!
				.map((c) => {
					const val = parseInt(c, 16) / 255;
					return val <= 0.03928
						? val / 12.92
						: Math.pow((val + 0.055) / 1.055, 2.4);
				});
			return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
		};

		const l1 = getLuminance(foreground);
		const l2 = getLuminance(background);
		const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

		const passesAA = ratio >= 4.5;
		const passesAALarge = ratio >= 3;
		const passesAAA = ratio >= 7;

		return JSON.stringify({
			foreground,
			background,
			contrastRatio: ratio.toFixed(2),
			wcag: {
				AA_normal: passesAA ? "pass" : "fail",
				AA_large: passesAALarge ? "pass" : "fail",
				AAA_normal: passesAAA ? "pass" : "fail",
			},
			message: `대비율 ${ratio.toFixed(2)}:1 - WCAG AA ${passesAA ? "통과" : "미달"}, AAA ${passesAAA ? "통과" : "미달"}`,
		});
	},
});

export const brandEditorTools = [
	updateBrandPropertyTool,
	suggestColorAdjustmentTool,
	checkContrastRatioTool,
];
