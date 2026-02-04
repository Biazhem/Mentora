"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System
          </div>
        </SelectItem>

        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Light
          </div>
        </SelectItem>

        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
