import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatItem {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendColor?: string
}

interface StatsGridProps {
  stats: StatItem[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.trend && (
              <p className="text-xs text-muted-foreground">
                <span className={stat.trendColor || "text-primary"}>{stat.trend}</span> from last month
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
