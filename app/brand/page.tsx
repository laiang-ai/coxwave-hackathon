"use client";

import { useEffect, useState } from "react";
import BrandGuideClient from "./BrandGuideClient";
import type { BrandType } from "./types";
import protopieOutput from "../../public/samples/protopie-output.json";
import { loadLogoImages, type LogoImageInput } from "@/lib/logo-storage";

export default function BrandGuidePage() {
	const [data, setData] = useState<BrandType | null>(null);
	const [logoImages, setLogoImages] = useState<LogoImageInput[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fallbackData = protopieOutput as BrandType;
		let revokeUrls = () => {};
		let isMounted = true;

		// Try to load from localStorage first - prefer generated data over mock
		const stored = localStorage.getItem("generatedBrandType");
		if (stored) {
			try {
				const parsedData = JSON.parse(stored);
				// Use localStorage data if it exists and has required structure
				if (parsedData && typeof parsedData === "object") {
					console.log("[BrandPage] Using localStorage data");
					setData(parsedData);
				} else {
					console.log("[BrandPage] Invalid localStorage data, using fallback");
					setData(fallbackData);
				}
			} catch (error) {
				console.error("Failed to parse stored brand data:", error);
				setData(fallbackData);
			}
		} else {
			// Fallback to mock data only if no localStorage data
			console.log("[BrandPage] No localStorage data, using fallback");
			setData(fallbackData);
		}

		const loadImages = async () => {
			const { images, revoke } = await loadLogoImages();
			if (!isMounted) {
				revoke();
				return;
			}
			revokeUrls = revoke;

			if (images.length > 0) {
				setLogoImages(images);
				setIsLoading(false);
				return;
			}

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
		};

		void loadImages();

		return () => {
			isMounted = false;
			revokeUrls();
		};
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
