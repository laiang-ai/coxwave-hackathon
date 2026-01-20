import type { BrandType } from "./types";

export const mockBrandType: BrandType = {
	meta: {
		brandName: "BrandKit Inc",
		version: "1.0.0",
		createdAt: "2026-01-20T00:00:00Z",
		updatedAt: "2026-01-20T00:00:00Z",
	},
	logo: {
		verticalLogo: {
			light: {
				url: "/assets/logo/vertical-light.svg",
				format: "svg",
				width: 200,
				height: 280,
			},
			dark: {
				url: "/assets/logo/vertical-dark.svg",
				format: "svg",
				width: 200,
				height: 280,
			},
		},
		horizontalLogo: {
			light: {
				url: "/assets/logo/horizontal-light.svg",
				format: "svg",
				width: 400,
				height: 100,
			},
			dark: {
				url: "/assets/logo/horizontal-dark.svg",
				format: "svg",
				width: 400,
				height: 100,
			},
		},
		symbols: {
			mainSymbol: {
				light: {
					url: "/assets/logo/symbol-light.svg",
					format: "svg",
					width: 100,
					height: 100,
				},
				dark: {
					url: "/assets/logo/symbol-dark.svg",
					format: "svg",
					width: 100,
					height: 100,
				},
			},
			textLogo: {
				light: {
					url: "/assets/logo/text-light.svg",
					format: "svg",
					width: 300,
					height: 60,
				},
				dark: {
					url: "/assets/logo/text-dark.svg",
					format: "svg",
					width: 300,
					height: 60,
				},
			},
			specialLogo: {
				light: {
					url: "/assets/logo/special-light.svg",
					format: "svg",
					width: 200,
					height: 200,
				},
				dark: {
					url: "/assets/logo/special-dark.svg",
					format: "svg",
					width: 200,
					height: 200,
				},
			},
			textLogoOnBackground: {
				withLightLogo: [
					{
						grayscale: 60,
						logo: {
							url: "/assets/logo/text-light.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 4.5,
					},
					{
						grayscale: 70,
						logo: {
							url: "/assets/logo/text-light.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 6.2,
					},
					{
						grayscale: 80,
						logo: {
							url: "/assets/logo/text-light.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 8.1,
					},
					{
						grayscale: 90,
						logo: {
							url: "/assets/logo/text-light.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 12.4,
					},
					{
						grayscale: 100,
						logo: {
							url: "/assets/logo/text-light.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 21.0,
					},
				],
				withDarkLogo: [
					{
						grayscale: 10,
						logo: {
							url: "/assets/logo/text-dark.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 18.5,
					},
					{
						grayscale: 20,
						logo: {
							url: "/assets/logo/text-dark.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 14.2,
					},
					{
						grayscale: 30,
						logo: {
							url: "/assets/logo/text-dark.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 10.8,
					},
					{
						grayscale: 40,
						logo: {
							url: "/assets/logo/text-dark.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 7.5,
					},
					{
						grayscale: 50,
						logo: {
							url: "/assets/logo/text-dark.svg",
							format: "svg",
							width: 300,
							height: 60,
						},
						contrastRatio: 5.3,
					},
				],
			},
		},
		spacingAndSize: {
			clearSpace: {
				unit: "x",
				value: 1,
				description: "로고 심볼 높이의 1배를 최소 여백으로 사용",
			},
			minimumSize: {
				print: {
					height: 10,
					unit: "mm",
				},
				digital: {
					height: 32,
					unit: "px",
				},
			},
			recommendedSizes: [
				{
					name: "Favicon",
					width: 32,
					height: 32,
					useCase: "브라우저 탭 아이콘",
				},
				{
					name: "App Icon",
					width: 512,
					height: 512,
					useCase: "앱 스토어 아이콘",
				},
				{
					name: "Social Media",
					width: 400,
					height: 400,
					useCase: "소셜 미디어 프로필",
				},
			],
		},
	},
	color: {
		brand: {
			primary: {
				name: "Brand Blue",
				hex: "#2563EB",
				rgb: {
					r: 37,
					g: 99,
					b: 235,
				},
				hsl: {
					h: 221,
					s: 83,
					l: 53,
				},
				scale: {
					"50": "#EFF6FF",
					"100": "#DBEAFE",
					"200": "#BFDBFE",
					"300": "#93C5FD",
					"400": "#60A5FA",
					"500": "#2563EB",
					"600": "#2563EB",
					"700": "#1D4ED8",
					"800": "#1E40AF",
					"900": "#1E3A8A",
					"950": "#172554",
				},
			},
			secondary: {
				name: "Brand Gray",
				hex: "#64748B",
				rgb: {
					r: 100,
					g: 116,
					b: 139,
				},
				scale: {
					"50": "#F8FAFC",
					"100": "#F1F5F9",
					"200": "#E2E8F0",
					"300": "#CBD5E1",
					"400": "#94A3B8",
					"500": "#64748B",
					"600": "#475569",
					"700": "#334155",
					"800": "#1E293B",
					"900": "#0F172A",
					"950": "#020617",
				},
			},
			accent: {
				name: "Accent Orange",
				hex: "#F97316",
				rgb: {
					r: 249,
					g: 115,
					b: 22,
				},
			},
		},
		lightTheme: {
			background: {
				primary: "#FFFFFF",
				secondary: "#F8FAFC",
				tertiary: "#F1F5F9",
			},
			foreground: {
				primary: "#0F172A",
				secondary: "#475569",
				muted: "#94A3B8",
			},
			border: {
				default: "#E2E8F0",
				muted: "#F1F5F9",
			},
			status: {
				success: "#22C55E",
				warning: "#F59E0B",
				error: "#EF4444",
				info: "#3B82F6",
			},
		},
		darkTheme: {
			background: {
				primary: "#0F172A",
				secondary: "#1E293B",
				tertiary: "#334155",
			},
			foreground: {
				primary: "#F8FAFC",
				secondary: "#CBD5E1",
				muted: "#64748B",
			},
			border: {
				default: "#334155",
				muted: "#1E293B",
			},
			status: {
				success: "#4ADE80",
				warning: "#FBBF24",
				error: "#F87171",
				info: "#60A5FA",
			},
		},
	},
	typography: {
		titleFont: {
			name: "Inter",
			fallback: ["system-ui", "sans-serif"],
			weights: [500, 600, 700],
			source: "google",
		},
		bodyFont: {
			name: "Inter",
			fallback: ["system-ui", "sans-serif"],
			weights: [400, 500, 600],
			source: "google",
		},
		monoFont: {
			name: "JetBrains Mono",
			fallback: ["monospace"],
			weights: [400, 500],
			source: "google",
		},
		scale: {
			display: {
				large: {
					fontFamily: "Inter",
					fontSize: 72,
					lineHeight: 1.1,
					letterSpacing: -0.02,
					fontWeight: 700,
				},
				medium: {
					fontFamily: "Inter",
					fontSize: 56,
					lineHeight: 1.1,
					letterSpacing: -0.02,
					fontWeight: 700,
				},
				small: {
					fontFamily: "Inter",
					fontSize: 44,
					lineHeight: 1.15,
					letterSpacing: -0.01,
					fontWeight: 600,
				},
			},
			heading: {
				h1: {
					fontFamily: "Inter",
					fontSize: 36,
					lineHeight: 1.2,
					letterSpacing: -0.01,
					fontWeight: 700,
				},
				h2: {
					fontFamily: "Inter",
					fontSize: 30,
					lineHeight: 1.25,
					letterSpacing: -0.01,
					fontWeight: 600,
				},
				h3: {
					fontFamily: "Inter",
					fontSize: 24,
					lineHeight: 1.3,
					fontWeight: 600,
				},
				h4: {
					fontFamily: "Inter",
					fontSize: 20,
					lineHeight: 1.35,
					fontWeight: 600,
				},
				h5: {
					fontFamily: "Inter",
					fontSize: 18,
					lineHeight: 1.4,
					fontWeight: 600,
				},
				h6: {
					fontFamily: "Inter",
					fontSize: 16,
					lineHeight: 1.4,
					fontWeight: 600,
				},
			},
			body: {
				large: {
					fontFamily: "Inter",
					fontSize: 18,
					lineHeight: 1.6,
					fontWeight: 400,
				},
				medium: {
					fontFamily: "Inter",
					fontSize: 16,
					lineHeight: 1.5,
					fontWeight: 400,
				},
				small: {
					fontFamily: "Inter",
					fontSize: 14,
					lineHeight: 1.5,
					fontWeight: 400,
				},
			},
			label: {
				large: {
					fontFamily: "Inter",
					fontSize: 14,
					lineHeight: 1.4,
					fontWeight: 500,
				},
				medium: {
					fontFamily: "Inter",
					fontSize: 12,
					lineHeight: 1.4,
					fontWeight: 500,
				},
				small: {
					fontFamily: "Inter",
					fontSize: 11,
					lineHeight: 1.4,
					fontWeight: 500,
					textTransform: "uppercase",
				},
			},
			caption: {
				fontFamily: "Inter",
				fontSize: 12,
				lineHeight: 1.4,
				fontWeight: 400,
			},
			overline: {
				fontFamily: "Inter",
				fontSize: 10,
				lineHeight: 1.5,
				letterSpacing: 0.1,
				fontWeight: 600,
				textTransform: "uppercase",
			},
		},
		application: [
			{
				medium: "website",
				name: "웹사이트",
				description: "데스크탑 및 태블릿 웹 브라우저용",
				styles: {
					title: "h1",
					subtitle: "h3",
					body: "medium",
					caption: "caption",
				},
			},
			{
				medium: "mobile",
				name: "모바일 앱",
				description: "iOS/Android 네이티브 앱용",
				styles: {
					title: "h2",
					subtitle: "h4",
					body: "small",
					caption: "caption",
				},
				adjustments: {
					baseSize: -2,
					lineHeightMultiplier: 1.1,
				},
			},
			{
				medium: "magazine",
				name: "매거진/인쇄물",
				description: "잡지, 브로셔, 카탈로그용",
				styles: {
					title: "large",
					subtitle: "h1",
					body: "large",
					caption: "caption",
				},
				adjustments: {
					lineHeightMultiplier: 1.2,
				},
			},
			{
				medium: "presentation",
				name: "프레젠테이션",
				description: "슬라이드 및 발표 자료용",
				styles: {
					title: "large",
					subtitle: "h2",
					body: "large",
				},
				adjustments: {
					baseSize: 4,
				},
			},
			{
				medium: "social",
				name: "소셜 미디어",
				description: "Instagram, Facebook, Twitter 등 SNS용",
				styles: {
					title: "h2",
					subtitle: "h4",
					body: "medium",
				},
			},
		],
	},
	// NEW: Brand Overview
	brandOverview: {
		mission:
			"우리는 브랜드 아이덴티티를 제품 경험으로 연결하는 가장 빠른 시작점을 제공합니다.",
		vision:
			"모든 브랜드가 일관된 디자인 시스템을 통해 사용자에게 신뢰와 가치를 전달하는 세상을 만듭니다.",
		values: [
			"일관성: 모든 터치포인트에서 통일된 경험",
			"혁신: 최신 기술로 디자인 프로세스 혁신",
			"접근성: 누구나 쉽게 사용할 수 있는 도구",
			"품질: 디테일에 대한 집착과 완성도",
		],
		personality: {
			traits: [
				{
					name: "혁신적",
					description: "최신 기술과 트렌드를 빠르게 반영하여 앞서 나갑니다.",
				},
				{
					name: "전문적",
					description: "디자인과 개발 모두에서 높은 품질을 추구합니다.",
				},
				{
					name: "친근한",
					description: "복잡한 기술을 쉽고 이해하기 쉽게 전달합니다.",
				},
			],
			archetype: "The Creator",
		},
	},
	// NEW: Tone of Voice
	toneOfVoice: {
		traits: [
			{
				name: "형식성",
				spectrum: ["캐주얼", "전문적"],
				value: 65,
				description: "전문성을 유지하되 지나치게 딱딱하지 않은 톤",
			},
			{
				name: "열정",
				spectrum: ["차분함", "열정적"],
				value: 70,
				description: "브랜드에 대한 열정과 확신을 전달",
			},
			{
				name: "친근함",
				spectrum: ["거리감", "친근함"],
				value: 75,
				description: "사용자와 가까운 친구처럼 소통",
			},
		],
		examples: [
			{
				scenario: "제품 소개",
				good: "브랜드 아이덴티티부터 제품까지, 한 번에 시작하세요.",
				bad: "당사 솔루션을 통해 귀사의 브랜드 가치를 극대화하실 수 있습니다.",
			},
			{
				scenario: "오류 메시지",
				good: "앗, 뭔가 잘못됐네요. 다시 시도해볼까요?",
				bad: "시스템 오류가 발생했습니다. 관리자에게 문의하십시오.",
			},
		],
		guidelines: [
			"항상 사용자를 중심에 두고 'You'를 사용합니다",
			"기술 용어는 필요할 때만 사용하고 설명을 덧붙입니다",
			"능동태를 사용하여 명확하고 직접적으로 전달합니다",
			"이모지는 적절히 사용하되 과하지 않게 합니다",
		],
	},
};
