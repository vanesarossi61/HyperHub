"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Newspaper,
  Radar,
  Archive,
  Users,
  UserCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SocialBatteryIndicator } from "./SocialBatteryIndicator"

const navItems = [
  {
    label: "Feed",
    href: "/feed",
    icon: Newspaper,
    description: "Tu timeline personalizado",
  },
  {
    label: "Radar",
    href: "/radar",
    icon: Radar,
    description: "Descubre personas afines",
  },
  {
    label: "El Baul",
    href: "/baul",
    icon: Archive,
    description: "Guarda tus ideas",
  },
  {
    label: "Body Doubling",
    href: "/body-doubling",
    icon: Users,
    description: "Trabaja acompanado/a",
  },
  {
    label: "Perfil",
    href: "/profile",
    icon: UserCircle,
    description: "Tu configuracion",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--background)]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/feed" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[var(--foreground)]">
            Hyper<span className="text-brand-600">Hub</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Battery indicator at bottom */}
      <div className="border-t border-[var(--border)] p-3">
        <SocialBatteryIndicator />
      </div>
    </aside>
  )
}
