"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">TaskFlow</h1>
        </Link>
        <Badge variant="secondary" className="font-medium">Professional Edition</Badge>
      </div>
    </header>
  )
}
