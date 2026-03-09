import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "battery"
}

const badgeVariants = {
  default: "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100",
  secondary: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  outline: "border border-[var(--border)] text-[var(--foreground)] bg-transparent",
  battery: "font-medium",
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
