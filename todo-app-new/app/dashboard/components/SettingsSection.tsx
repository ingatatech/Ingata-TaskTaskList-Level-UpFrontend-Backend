// dashboard/components/SettingsSection.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-foreground">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Preferences</CardTitle>
          <CardDescription>Customize your TaskFlow experience</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User preferences panel coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}