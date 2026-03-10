"use client"

import { useRouter } from "next/navigation"
import { ONBOARDING_STEPS } from "@hyperhub/shared"
import type { OnboardingStepType } from "@hyperhub/shared"

interface OnboardingLayoutProps {
  currentStep: OnboardingStepType
  children: React.ReactNode
}

export default function OnboardingLayout({ currentStep, children }: OnboardingLayoutProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.key === currentStep)
  const progress = ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Bienvenido/a a <span className="text-brand-600">HyperHub</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Vamos a personalizar tu experiencia. Todo es opcional y modificable despues.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {ONBOARDING_STEPS.map((step, idx) => (
              <div
                key={step.key}
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  idx <= currentIndex
                    ? "text-brand-600"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    idx < currentIndex
                      ? "bg-brand-600 text-white"
                      : idx === currentIndex
                      ? "border-2 border-brand-600 text-brand-600"
                      : "border-2 border-[var(--border)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {idx < currentIndex ? "\u2713" : step.stepNumber}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--muted)]">
            <div
              className="h-2 rounded-full bg-brand-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
          {children}
        </div>

        {/* Reassurance */}
        <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
          Puedes cambiar todo esto cuando quieras desde tu perfil.
        </p>
      </div>
    </div>
  )
}
