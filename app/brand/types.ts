export type LogoAsset = {
	url: string;
	format: string;
	width: number;
	height: number;
};

export type TypeScale = {
	fontFamily: string;
	fontSize: number;
	lineHeight: number;
	fontWeight: number;
	letterSpacing?: number;
	textTransform?: string;
};

export type BrandType = {
	meta: {
		brandName: string;
		version: string;
		createdAt: string;
		updatedAt: string;
	};
	logo: {
		verticalLogo: { light: LogoAsset; dark: LogoAsset };
		horizontalLogo: { light: LogoAsset; dark: LogoAsset };
		symbols: {
			mainSymbol: { light: LogoAsset; dark: LogoAsset };
			textLogo: { light: LogoAsset; dark: LogoAsset };
			specialLogo: { light: LogoAsset; dark: LogoAsset };
			textLogoOnBackground: {
				withLightLogo: Array<{
					grayscale: number;
					logo: LogoAsset;
					contrastRatio: number;
				}>;
				withDarkLogo: Array<{
					grayscale: number;
					logo: LogoAsset;
					contrastRatio: number;
				}>;
			};
		};
		spacingAndSize: {
			clearSpace: { unit: string; value: number; description: string };
			minimumSize: {
				print: { height: number; unit: string };
				digital: { height: number; unit: string };
			};
			recommendedSizes: Array<{
				name: string;
				width: number;
				height: number;
				useCase: string;
			}>;
		};
	};
	color: {
		brand: {
			primary: { name: string; hex: string; scale: Record<string, string> };
			secondary: { name: string; hex: string; scale: Record<string, string> };
			accent: { name: string; hex: string };
		};
		lightTheme: {
			background: Record<string, string>;
			foreground: Record<string, string>;
			border: Record<string, string>;
			status: Record<string, string>;
		};
		darkTheme: {
			background: Record<string, string>;
			foreground: Record<string, string>;
			border: Record<string, string>;
			status: Record<string, string>;
		};
	};
	typography: {
		scale: {
			display: Record<string, TypeScale>;
			heading: Record<string, TypeScale>;
			body: Record<string, TypeScale>;
			label: Record<string, TypeScale>;
			caption: TypeScale;
			overline: TypeScale;
		};
		application: Array<{
			medium: string;
			name: string;
			description: string;
			styles: Record<string, string>;
			adjustments?: Record<string, number>;
		}>;
	};
};

export type ThemeColors = {
	light: {
		background: Record<string, string>;
		foreground: Record<string, string>;
		border: Record<string, string>;
	};
	dark: {
		background: Record<string, string>;
		foreground: Record<string, string>;
		border: Record<string, string>;
	};
	brand: {
		primary: string;
		secondary: string;
		accent: string;
	};
};
