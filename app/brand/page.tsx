"use client";

import { useEffect, useState } from "react";
import BrandGuideClient from "./BrandGuideClient";
import { mockBrandType } from "./mockBrandType";
import type { BrandType } from "./types";

export default function BrandGuidePage() {
	const [brandData, setBrandData] = useState<BrandType | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check localStorage for generated brand data
		const storedData = localStorage.getItem("generatedBrandType");
		if (storedData) {
			try {
				const parsed = JSON.parse(storedData) as BrandType;
				setBrandData(parsed);
			} catch {
				setBrandData(mockBrandType);
			}
		} else {
			setBrandData(mockBrandType);
		}
		setIsLoading(false);
	}, []);

	if (isLoading || !brandData) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-sm text-secondary">Loading brand guide...</p>
				</div>
			</div>
		);
	}

	return <BrandGuideClient data={brandData} />;
}
