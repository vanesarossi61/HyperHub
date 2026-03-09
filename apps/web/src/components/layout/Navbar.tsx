"use client"

import { UserButton } from "@clerk/nextjs"

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-6">
      <div>
        {/* Search or breadcrumbs can go here */}
      </div>
      <div className="flex items-center gap-4">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  )
}
