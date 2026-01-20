"use client";

import BrandGuideClient from "./BrandGuideClient";
import { mockCocaColaBrandType } from "./mockCocaColaBrandType";

export default function BrandGuidePage() {
  return <BrandGuideClient data={mockCocaColaBrandType} />;
}
