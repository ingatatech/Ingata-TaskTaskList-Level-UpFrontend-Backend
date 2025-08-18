"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description: string
  actionButton?: {
    label: string
    icon: React.ReactNode
    onClick?: () => void
    trigger?: React.ReactNode
  }
}

export function PageHeader({ title, description, actionButton }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actionButton &&
        (actionButton.trigger || (
          <Button className="font-medium" onClick={actionButton.onClick}>
            {actionButton.icon}
            {actionButton.label}
          </Button>
        ))}
    </div>
  )
}
