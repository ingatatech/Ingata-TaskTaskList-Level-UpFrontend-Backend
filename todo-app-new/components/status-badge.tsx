import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  type?: "status" | "priority"
}

export function StatusBadge({ status, type = "status" }: StatusBadgeProps) {
  const getVariant = () => {
    if (type === "priority") {
      switch (status) {
        case "high":
          return "destructive"
        case "medium":
          return "default"
        case "low":
          return "secondary"
        default:
          return "secondary"
      }
    }

    // Status type
    switch (status) {
      case "active":
      case "completed":
        return "default"
      case "inactive":
      case "pending":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return <Badge variant={getVariant()}>{status}</Badge>
}
