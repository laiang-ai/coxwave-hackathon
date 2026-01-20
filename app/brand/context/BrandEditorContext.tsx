"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import type { UseBrandDataReturn } from "../hooks/useBrandData";
import { useBrandData } from "../hooks/useBrandData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { BrandType } from "../types";

// Section customization settings
export interface SectionCustomization {
	sectionOrder: string[];
	hiddenSections: string[];
}

// Property inspector state
export interface InspectorState {
	isOpen: boolean;
	path: string | null;
	currentValue: any;
}

// Chat message
export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	metadata?: {
		updates?: Array<{ path: string; value: any; reason?: string }>;
	};
}

// AI assistant state
export interface AIAssistantState {
	isOpen: boolean;
	messages: ChatMessage[];
	isStreaming: boolean;
	currentStreamContent: string;
	targetPath?: string;
	prompt?: string;
}

// Logo image from user upload
export interface LogoImage {
	id: string;
	name: string;
	dataUrl: string;
}

// Complete editor state
export interface BrandEditorState extends UseBrandDataReturn {
	// User uploaded logo images
	logoImages: LogoImage[];

	// Inspector
	inspector: InspectorState;
	openInspector: (path: string) => void;
	closeInspector: () => void;

	// AI Assistant
	aiAssistant: AIAssistantState;
	openAI: (context?: { targetPath?: string; prompt?: string }) => void;
	closeAI: () => void;
	addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
	clearMessages: () => void;
	setStreaming: (isStreaming: boolean) => void;
	appendStreamContent: (content: string) => void;

	// Section Customization
	customization: SectionCustomization;
	setCustomization: (
		value:
			| SectionCustomization
			| ((prev: SectionCustomization) => SectionCustomization),
	) => void;
	toggleSectionVisibility: (sectionId: string) => void;
	reorderSections: (newOrder: string[]) => void;
	resetCustomization: () => void;

	// Export/Import
	exportData: (format: "json" | "overrides" | "css" | "tailwind") => void;
	importData: (data: BrandType) => void;
}

const BrandEditorContext = createContext<BrandEditorState | null>(null);

// Default section order (will be populated from registry)
const defaultSectionOrder = [
	"brand-overview",
	"logo-system",
	"color-brand",
	"color-themes",
	"typography",
	"spacing",
	"visual-elements",
	"tone-of-voice",
	"template-map",
];

const defaultCustomization: SectionCustomization = {
	sectionOrder: defaultSectionOrder,
	hiddenSections: [],
};

export interface BrandEditorProviderProps {
	children: ReactNode;
	initialData: BrandType;
	logoImages?: LogoImage[];
}

export function BrandEditorProvider({
	children,
	initialData,
	logoImages = [],
}: BrandEditorProviderProps) {
	// Brand data management
	const brandData = useBrandData(initialData);

	// Inspector state
	const [inspector, setInspector] = useState<InspectorState>({
		isOpen: false,
		path: null,
		currentValue: undefined,
	});

	// AI assistant state
	const [aiAssistant, setAIAssistant] = useState<AIAssistantState>({
		isOpen: true,
		messages: [],
		isStreaming: false,
		currentStreamContent: "",
	});

	// Section customization
	const [customization, setCustomization] =
		useLocalStorage<SectionCustomization>(
			"brand-customization",
			defaultCustomization,
		);

	// Inspector actions
	const openInspector = useCallback(
		(path: string) => {
			const value = path
				.split(".")
				.reduce((obj, key) => obj?.[key], brandData.mergedData as any);
			setAIAssistant((prev) => ({
				...prev,
				isOpen: false,
			}));
			setInspector({
				isOpen: true,
				path,
				currentValue: value,
			});
		},
		[brandData.mergedData],
	);

	const closeInspector = useCallback(() => {
		setInspector({
			isOpen: false,
			path: null,
			currentValue: undefined,
		});
	}, []);

	// AI assistant actions
	const openAI = useCallback(
		(context?: { targetPath?: string; prompt?: string }) => {
			setInspector((prev) => ({
				...prev,
				isOpen: false,
			}));
			setAIAssistant((prev) => ({
				...prev,
				isOpen: true,
				...context,
			}));
		},
		[],
	);

	const closeAI = useCallback(() => {
		setAIAssistant((prev) => ({
			...prev,
			isOpen: false,
		}));
	}, []);

	// Message management
	const addMessage = useCallback(
		(message: Omit<ChatMessage, "id" | "timestamp">) => {
			const newMessage: ChatMessage = {
				...message,
				id: crypto.randomUUID(),
				timestamp: new Date(),
			};
			setAIAssistant((prev) => ({
				...prev,
				messages: [...prev.messages, newMessage],
				currentStreamContent: "",
			}));
		},
		[],
	);

	const clearMessages = useCallback(() => {
		setAIAssistant((prev) => ({
			...prev,
			messages: [],
			currentStreamContent: "",
		}));
	}, []);

	const setStreaming = useCallback((isStreaming: boolean) => {
		setAIAssistant((prev) => ({
			...prev,
			isStreaming,
			currentStreamContent: isStreaming ? prev.currentStreamContent : "",
		}));
	}, []);

	const appendStreamContent = useCallback((content: string) => {
		setAIAssistant((prev) => ({
			...prev,
			currentStreamContent: prev.currentStreamContent + content,
		}));
	}, []);

	// Section customization actions
	const toggleSectionVisibility = useCallback(
		(sectionId: string) => {
			setCustomization((prev) => ({
				...prev,
				hiddenSections: prev.hiddenSections.includes(sectionId)
					? prev.hiddenSections.filter((id) => id !== sectionId)
					: [...prev.hiddenSections, sectionId],
			}));
		},
		[setCustomization],
	);

	const reorderSections = useCallback(
		(newOrder: string[]) => {
			setCustomization((prev) => ({
				...prev,
				sectionOrder: newOrder,
			}));
		},
		[setCustomization],
	);

	const resetCustomization = useCallback(() => {
		setCustomization(defaultCustomization);
	}, [setCustomization]);

	// Export/Import actions
	const exportData = useCallback(
		(format: "json" | "overrides" | "css" | "tailwind") => {
			let content: string;
			let filename: string;
			let mimeType: string;

			const brandName = brandData.mergedData?.meta?.brandName ?? "brand";

			switch (format) {
				case "json":
					content = JSON.stringify(brandData.mergedData, null, 2);
					filename = `${brandName}-brand.json`;
					mimeType = "application/json";
					break;
				case "overrides":
					content = JSON.stringify(brandData.overrides, null, 2);
					filename = `${brandName}-overrides.json`;
					mimeType = "application/json";
					break;
				case "css":
					// TODO: Implement CSS export
					content = "/* CSS export not yet implemented */";
					filename = `${brandName}-variables.css`;
					mimeType = "text/css";
					break;
				case "tailwind":
					// TODO: Implement Tailwind export
					content = "// Tailwind export not yet implemented";
					filename = `${brandName}-tailwind.config.js`;
					mimeType = "text/javascript";
					break;
			}

			const blob = new Blob([content], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		},
		[brandData.mergedData, brandData.overrides],
	);

	const importData = useCallback((data: BrandType) => {
		// TODO: Implement import logic
		console.log("Import data:", data);
	}, []);

	const value: BrandEditorState = {
		...brandData,
		logoImages,
		inspector,
		openInspector,
		closeInspector,
		aiAssistant,
		openAI,
		closeAI,
		addMessage,
		clearMessages,
		setStreaming,
		appendStreamContent,
		customization,
		setCustomization,
		toggleSectionVisibility,
		reorderSections,
		resetCustomization,
		exportData,
		importData,
	};

	return (
		<BrandEditorContext.Provider value={value}>
			{children}
		</BrandEditorContext.Provider>
	);
}

/**
 * Hook to access brand editor context
 */
export function useBrandEditor() {
	const context = useContext(BrandEditorContext);
	if (!context) {
		throw new Error("useBrandEditor must be used within BrandEditorProvider");
	}
	return context;
}
