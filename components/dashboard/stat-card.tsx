import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {title}
            </p>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="mono-value text-[28px] font-semibold leading-none tracking-tight text-foreground">
              {value}
            </span>
          </div>
          {description && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/10">
          <Icon className="h-4 w-4 text-primary/80" />
        </div>
      </div>
    </Card>
  )
}
