import fs from "node:fs";
import path from "node:path";
import BrandGuideClient from "./BrandGuideClient";
import type { BrandType } from "./types";

const loadBrandType = () => {
	const dataPath = path.join(process.cwd(), "type.json");
	const raw = fs.readFileSync(dataPath, "utf-8");
	return JSON.parse(raw) as BrandType;
};

export default function BrandGuidePage() {
	const data = loadBrandType();
	return <BrandGuideClient data={data} />;
}
