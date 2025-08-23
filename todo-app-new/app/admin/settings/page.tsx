// admin/settings/page.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-foreground">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">System Settings</CardTitle>
          <CardDescription>Configure platform settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">System settings panel coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}