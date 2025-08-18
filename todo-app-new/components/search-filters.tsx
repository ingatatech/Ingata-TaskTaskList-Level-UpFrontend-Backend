"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface FilterOption {
  value: string
  label: string
}

interface SearchFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: {
    value: string
    onValueChange: (value: string) => void
    placeholder: string
    options: FilterOption[]
  }[]
}

export function SearchFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {filters.map((filter, index) => (
        <Select key={index} value={filter.value} onValueChange={filter.onValueChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}
