"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Type,
  Palette,
  Shapes,
  Files,
  MessageSquare,
  Sparkles,
  Download,
  FileText,
  ArrowLeft,
} from "lucide-react";
import type { BrandType } from "../types";

interface BrandNavigationProps {
  brandData: BrandType;
  activeSection: string;
  onSectionClick: (section: string) => void;
  onExport: () => void;
  onDownloadJson: () => void;
}

export function BrandNavigation({
  brandData,
  activeSection,
  onSectionClick,
  onExport,
  onDownloadJson,
}: BrandNavigationProps) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "logo", label: "Logo & Symbol", icon: Shapes },
    { id: "brand-overview", label: "Brand DNA", icon: Sparkles },
    { id: "tone-of-voice", label: "Voice & Tone", icon: MessageSquare },
    { id: "typography", label: "Typography", icon: Type },
    { id: "colors", label: "Color Palette", icon: Palette },
    { id: "templates", label: "Templates", icon: Files },
  ];

  const brandBrandColor = brandData.color.brand.primary.hex;

  return (
    <nav className="flex h-screen w-[280px] shrink-0 flex-col border-r border-slate-200/60 bg-white/60 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-col gap-6 p-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </Link>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: brandBrandColor }}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Brand Guide
            </span>
          </div>
          <h1
            className="text-xl font-bold text-slate-900"
            style={{ fontFamily: "var(--brand-font)" }}
          >
            {brandData.meta.brandName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="opacity-60">v{brandData.meta.version}</span>
            <span className="opacity-30">•</span>
            <span className="opacity-60">Exhibition Edition</span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-1">
          <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Design System
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionClick(item.id)}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "text-[color:var(--brand-primary)]"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Actions
          </p>
          <Link
            href="/brand/mockups"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-white/50 hover:text-slate-900"
          >
            <Sparkles className="h-4 w-4 text-violet-500" />
            Mockup Studio
          </Link>
          <button
            onClick={onPrint}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-white/50 hover:text-slate-900"
          >
            <FileText className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            Export PDF
          </button>
          <button
            onClick={onDownloadJson}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-white/50 hover:text-slate-900"
          >
            <Download className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            Download JSON
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200/60 p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <span className="text-xs font-bold">C</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Coxwave</p>
              <p className="text-[10px] text-slate-500">Hackathon Build</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function onPrint() {
  if (typeof window !== "undefined") window.print();
}
