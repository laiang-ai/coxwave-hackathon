"use client";

import type { CSSProperties } from "react";
import type { BrandType } from "../../types";
import { SectionWrapper } from "./SectionWrapper";

interface ToneOfVoiceSectionProps {
	data: BrandType["toneOfVoice"];
	cardStyle: CSSProperties;
	mutedCardStyle: CSSProperties;
}

/**
 * ToneOfVoiceSection - Brand voice traits and examples
 */
export function ToneOfVoiceSection({
	data,
	cardStyle,
	mutedCardStyle,
}: ToneOfVoiceSectionProps) {
	if (!data) return null;

	return (
		<section className="snap-start">
			<div className="mx-auto flex min-h-[65vh] max-w-6xl items-center px-4 py-10">
				<div
					className="motion-fade-up grid w-full gap-8 border p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]"
					style={cardStyle}
				>
					<div className="space-y-4">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-muted)]">
							Tone of Voice
						</p>
						<h3 className="text-3xl font-semibold">Communication Style</h3>
						<p className="text-sm text-[color:var(--fg-secondary)]">
							How we speak to our audience and express our brand personality.
						</p>
					</div>

					<div className="space-y-5">
						{/* Voice Traits */}
						{data.traits && data.traits.length > 0 && (
							<div className="border p-5" style={cardStyle}>
								<p className="mb-4 text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
									Voice Characteristics
								</p>
								<div className="space-y-4">
									{data.traits.map((trait, index) => (
										<SectionWrapper
											key={index}
											path={`toneOfVoice.traits.${index}.value`}
											editable={true}
											className="transition-all"
										>
											<div>
												<div className="mb-2 flex items-center justify-between text-sm">
													<span className="font-medium text-[color:var(--fg-primary)]">
														{trait.name}
													</span>
													<span className="text-xs text-[color:var(--fg-muted)]">
														{trait.value}%
													</span>
												</div>
												<div className="mb-2 flex items-center justify-between text-xs text-[color:var(--fg-muted)]">
													<span>{trait.spectrum[0]}</span>
													<span>{trait.spectrum[1]}</span>
												</div>
												<div className="relative h-2 overflow-hidden rounded-full bg-[color:var(--bg-secondary)]">
													<div
														className="absolute left-0 top-0 h-full rounded-full bg-[color:var(--brand-primary)] transition-all"
														style={{ width: `${trait.value}%` }}
													/>
												</div>
												{trait.description && (
													<p className="mt-2 text-xs text-[color:var(--fg-secondary)]">
														{trait.description}
													</p>
												)}
											</div>
										</SectionWrapper>
									))}
								</div>
							</div>
						)}

						{/* Examples */}
						{data.examples && data.examples.length > 0 && (
							<div className="border p-5" style={mutedCardStyle}>
								<p className="mb-4 text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
									Usage Examples
								</p>
								<div className="space-y-4">
									{data.examples.map((example, index) => (
										<div
											key={index}
											className="border p-4 rounded-lg"
											style={cardStyle}
										>
											<p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
												{example.scenario}
											</p>
											<SectionWrapper
												path={`toneOfVoice.examples.${index}.good`}
												editable={true}
												className="mb-3 border-l-2 border-green-500 pl-3 transition-all hover:border-green-600"
											>
												<div>
													<p className="mb-1 text-xs font-medium text-green-600">
														✓ Good
													</p>
													<p className="text-sm text-[color:var(--fg-primary)]">
														"{example.good}"
													</p>
												</div>
											</SectionWrapper>
											{example.bad && (
												<SectionWrapper
													path={`toneOfVoice.examples.${index}.bad`}
													editable={true}
													className="border-l-2 border-red-500 pl-3 transition-all hover:border-red-600"
												>
													<div>
														<p className="mb-1 text-xs font-medium text-red-600">
															✗ Avoid
														</p>
														<p className="text-sm text-[color:var(--fg-primary)]">
															"{example.bad}"
														</p>
													</div>
												</SectionWrapper>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{/* Guidelines */}
						{data.guidelines && data.guidelines.length > 0 && (
							<div className="border p-5" style={cardStyle}>
								<p className="mb-4 text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
									Guidelines
								</p>
								<ul className="space-y-2">
									{data.guidelines.map((guideline, index) => (
										<SectionWrapper
											key={index}
											path={`toneOfVoice.guidelines.${index}`}
											editable={true}
											className="flex items-start gap-3 transition-all hover:bg-[color:var(--bg-secondary)] rounded p-2"
										>
											<span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)] text-xs text-white">
												{index + 1}
											</span>
											<p className="flex-1 text-sm text-[color:var(--fg-secondary)]">
												{guideline}
											</p>
										</SectionWrapper>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
