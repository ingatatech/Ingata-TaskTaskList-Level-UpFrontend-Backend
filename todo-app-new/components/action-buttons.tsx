"use client"

import React from "react"  // ✅ important to fix ReferenceError
import { Button } from "@/components/ui/button"

interface ActionButton {
  id?: string | number        // optional unique id
  icon: React.ReactNode
  onClick?: () => void
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary"
  className?: string
  trigger?: React.ReactNode
}

interface ActionButtonsProps {
  actions: ActionButton[]
}

export function ActionButtons({ actions }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end space-x-2">
      {actions.map((action, index) => {
        const key = action.id ?? index
        return action.trigger ? (
          <React.Fragment key={key}>
            {action.trigger}
          </React.Fragment>
        ) : (
          <Button
            key={key}
            variant={action.variant || "ghost"}
            size="sm"
            onClick={action.onClick}
            className={action.className}
          >
            {action.icon}
          </Button>
        )
      })}
    </div>
  )
}
