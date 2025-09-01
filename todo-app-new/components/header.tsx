"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground leading-none">TaskFlow</h1>
        </Link>

        {/* Right side: Badge + Login */}
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="font-medium">Professional Edition</Badge>
          <Link href="/login">
            <Button size="sm" className="font-medium">Login</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
