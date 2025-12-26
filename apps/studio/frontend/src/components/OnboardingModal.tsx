import { useState } from "react";
import { templates } from "../templates";
import type { GalleryTemplate } from "@teamflojo/floimg-studio-shared";

const ONBOARDING_STORAGE_KEY = "floimg-studio-onboarded";

// Featured templates to show in onboarding
// Prioritize pipeline templates that show FloImg's unique value
const FEATURED_TEMPLATE_IDS = [
  "chart-watermark", // Pipeline: generate → watermark → round corners (core value prop)
  "diagram-webp", // Pipeline: generate → optimize format
  "wifi-qr", // Quick value: practical, immediately useful
];

// Check localStorage on module load (client-side only)
function getInitialOpenState(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(ONBOARDING_STORAGE_KEY);
}

interface OnboardingModalProps {
  onSelectTemplate: (templateId: string) => void;
  onSkip: () => void;
}

export function OnboardingModal({ onSelectTemplate, onSkip }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(getInitialOpenState);

  const handleSelectTemplate = (templateId: string) => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOpen(false);
    onSelectTemplate(templateId);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOpen(false);
    onSkip();
  };

  const handleBrowseTemplates = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOpen(false);
    onSkip();
  };

  if (!isOpen) return null;

  const featuredTemplates = FEATURED_TEMPLATE_IDS.map((id) =>
    templates.find((t) => t.id === id)
  ).filter(Boolean) as GalleryTemplate[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to FloImg Studio
          </h2>
          <p className="text-gray-600 dark:text-zinc-400">
            Create beautiful images with visual workflows. Start with a template to see it in
            action.
          </p>
        </div>

        {/* Featured templates */}
        <div className="px-8 py-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide mb-4">
            Quick Start Templates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group p-4 rounded-xl border-2 border-gray-200 dark:border-zinc-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all text-left bg-gray-50 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-900/20"
              >
                <div className="text-2xl mb-2">
                  {template.category === "Charts" && "📊"}
                  {template.category === "Diagrams" && "📐"}
                  {template.category === "Pipelines" && "🔗"}
                  {template.category === "QR Codes" && "📱"}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {template.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 line-clamp-2">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-between">
          <button
            onClick={handleBrowseTemplates}
            className="text-sm text-gray-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Browse all templates →
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Start from scratch
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Reset onboarding state (for testing)
 */
export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
