"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { OnboardingStepType } from "@hyperhub/shared"
import OnboardingLayout from "./OnboardingLayout"
import StepBasics from "./steps/StepBasics"
import StepHyperfoci from "./steps/StepHyperfoci"
import StepSensory from "./steps/StepSensory"
import StepBatteryTutorial from "./steps/StepBatteryTutorial"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStepType>("BASICS")
  const [isLoading, setIsLoading] = useState(true)

  // Check if user already completed onboarding
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.profile) {
            if (data.data.profile.onboardingCompleted) {
              router.push("/feed")
              return
            }
            setCurrentStep(data.data.profile.onboardingStep || "BASICS")
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err)
      } finally {
        setIsLoading(false)
      }
    }
    checkOnboarding()
  }, [router])

  const handleNext = async (nextStep: OnboardingStepType) => {
    // Save progress to backend
    try {
      await fetch("/api/onboarding/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: nextStep }),
      })
    } catch (err) {
      console.error("Failed to save onboarding progress:", err)
    }

    if (nextStep === "COMPLETED") {
      router.push("/feed")
      return
    }
    setCurrentStep(nextStep)
  }

  const handleSkip = () => {
    handleNext("COMPLETED")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case "BASICS":
        return <StepBasics onNext={() => handleNext("HYPERFOCI")} onSkip={handleSkip} />
      case "HYPERFOCI":
        return <StepHyperfoci onNext={() => handleNext("SENSORY")} onBack={() => setCurrentStep("BASICS")} onSkip={handleSkip} />
      case "SENSORY":
        return <StepSensory onNext={() => handleNext("BATTERY_TUTORIAL")} onBack={() => setCurrentStep("HYPERFOCI")} onSkip={handleSkip} />
      case "BATTERY_TUTORIAL":
        return <StepBatteryTutorial onNext={() => handleNext("COMPLETED")} onBack={() => setCurrentStep("SENSORY")} />
      default:
        return <StepBasics onNext={() => handleNext("HYPERFOCI")} onSkip={handleSkip} />
    }
  }

  return (
    <OnboardingLayout currentStep={currentStep}>
      {renderStep()}
    </OnboardingLayout>
  )
}
