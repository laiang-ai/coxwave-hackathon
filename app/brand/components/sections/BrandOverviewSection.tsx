"use client";

import type { CSSProperties } from "react";
import type { BrandType } from "../../types";
import { SectionWrapper } from "./SectionWrapper";

interface BrandOverviewSectionProps {
	data: BrandType["brandOverview"];
	cardStyle: CSSProperties;
	mutedCardStyle: CSSProperties;
}

/**
 * BrandOverviewSection - Mission, Vision, Values, Personality
 */
export function BrandOverviewSection({
	data,
	cardStyle,
	mutedCardStyle,
}: BrandOverviewSectionProps) {
	if (!data) return null;

	return (
		<section className="snap-start">
			<div className="mx-auto flex  max-w-6xl items-center px-4 py-6">
				<div
					className="motion-fade-up grid w-full gap-3 border p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]"
					style={cardStyle}
				>
					<div className="space-y-4">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
							Brand Overview
						</p>
						<h3 className="text-3xl font-semibold">Mission, Vision & Values</h3>
						<p className="text-sm text-[color:var(--fg-secondary)]">
							Core principles that define our brand identity and guide our
							decisions.
						</p>
					</div>

					<div className="space-y-5">
						{/* Mission */}
						{data.mission && (
							<SectionWrapper
								path="brandOverview.mission"
								editable={true}
								className="border p-5 rounded-lg transition-all hover:shadow-md"
							>
								<div style={cardStyle}>
									<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
										Mission
									</p>
									<p className="mt-3 text-base text-[color:var(--fg-primary)]">
										{data.mission}
									</p>
								</div>
							</SectionWrapper>
						)}

						{/* Vision */}
						{data.vision && (
							<SectionWrapper
								path="brandOverview.vision"
								editable={true}
								className="border p-5 rounded-lg transition-all hover:shadow-md"
							>
								<div style={cardStyle}>
									<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
										Vision
									</p>
									<p className="mt-3 text-base text-[color:var(--fg-primary)]">
										{data.vision}
									</p>
								</div>
							</SectionWrapper>
						)}

						{/* Values */}
						{data.values && data.values.length > 0 && (
							<div className="border p-5" style={mutedCardStyle}>
								<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
									Core Values
								</p>
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									{data.values.map((value, index) => (
										<SectionWrapper
											key={index}
											path={`brandOverview.values.${index}`}
											editable={true}
											className="border px-4 py-3 rounded-lg transition-all hover:shadow-sm"
										>
											<div
												style={cardStyle}
												className="flex items-center gap-3"
											>
												<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brand-primary)] text-xs font-semibold text-white">
													{index + 1}
												</span>
												<span className="text-sm text-[color:var(--fg-primary)]">
													{value}
												</span>
											</div>
										</SectionWrapper>
									))}
								</div>
							</div>
						)}

						{/* Personality */}
						{data.personality && (
							<div className="border p-5" style={cardStyle}>
								<div className="mb-4 flex items-center justify-between">
									<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
										Brand Personality
									</p>
									{data.personality.archetype && (
										<span className="rounded-full bg-[color:var(--brand-primary)] px-3 py-1 text-xs font-medium text-white">
											{data.personality.archetype}
										</span>
									)}
								</div>
								<div className="space-y-3">
									{data.personality.traits.map((trait, index) => (
										<SectionWrapper
											key={index}
											path={`brandOverview.personality.traits.${index}.description`}
											editable={true}
											className="border-l-2 pl-4 transition-all hover:border-[color:var(--brand-primary)]"
											style={{ borderColor: "var(--border-default)" }}
										>
											<div>
												<p className="font-medium text-[color:var(--fg-primary)]">
													{trait.name}
												</p>
												<p className="mt-1 text-sm text-[color:var(--fg-secondary)]">
													{trait.description}
												</p>
											</div>
										</SectionWrapper>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
