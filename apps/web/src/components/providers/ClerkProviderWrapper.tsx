"use client"

import { ClerkProvider } from "@clerk/nextjs"

interface ClerkProviderWrapperProps {
  children: React.ReactNode
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4c6ef5",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-brand-600 hover:bg-brand-700 text-white rounded-xl",
          card: "rounded-2xl shadow-sm",
          headerTitle: "text-[var(--foreground)]",
          headerSubtitle: "text-[var(--muted-foreground)]",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
