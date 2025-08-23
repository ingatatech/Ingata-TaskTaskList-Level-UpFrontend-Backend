// admin/profile/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const [adminName, setAdminName] = useState("Admin User")
  const [adminEmail, setAdminEmail] = useState("admin@taskflow.com")

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-foreground">Admin Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Profile Settings</CardTitle>
          <CardDescription>Manage your admin account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  )
}