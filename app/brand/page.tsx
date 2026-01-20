"use client";

import { useEffect, useState } from "react";
import BrandGuideClient from "./BrandGuideClient";
import type { BrandType } from "./types";
import protopieOutput from "../../public/samples/protopie-output.json";

type LogoImage = {
	id: string;
	name: string;
	dataUrl: string;
};

export default function BrandGuidePage() {
	const [data, setData] = useState<BrandType | null>(null);
	const [logoImages, setLogoImages] = useState<LogoImage[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fallbackData = protopieOutput as BrandType;
		const usesSampleImages = (value: BrandType) =>
			value?.logo?.horizontalLogo?.light?.url?.startsWith("/samples/");

		// Try to load from localStorage first
		const stored = localStorage.getItem("generatedBrandType");
		if (stored) {
			try {
				const parsedData = JSON.parse(stored);
				setData(usesSampleImages(parsedData) ? parsedData : fallbackData);
			} catch (error) {
				console.error("Failed to parse stored brand data:", error);
				setData(fallbackData);
			}
		} else {
			// Fallback to mock data
			setData(fallbackData);
		}

		// Load user uploaded logo images
		const storedImages = localStorage.getItem("brandLogoImages");
		if (storedImages) {
			try {
				const parsedImages = JSON.parse(storedImages);
				setLogoImages(parsedImages);
			} catch (error) {
				console.error("Failed to parse stored logo images:", error);
			}
		}

		setIsLoading(false);
	}, []);

	if (isLoading || !data) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />
					<p className="text-neutral-600">브랜드 데이터 로딩 중...</p>
				</div>
			</div>
		);
	}

	return <BrandGuideClient data={data} logoImages={logoImages} />;
}
