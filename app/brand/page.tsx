import BrandGuideClient from "./BrandGuideClient";
import { mockBrandType } from "./mockBrandType";

export default function BrandGuidePage() {
	return <BrandGuideClient data={mockBrandType} />;
}
