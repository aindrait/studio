"use client"

import * as React from "react"
import { useTheme as useNextTheme } from "next-themes"
import { useTheme } from "@/components/theme-provider"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Palette } from "lucide-react"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Palette className="mr-2" />
          Themes
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Default
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => setTheme("light theme-zinc")}>
          <Sun className="mr-2 h-4 w-4" />
          Zinc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark theme-zinc")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark Zinc
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => setTheme("light theme-stone")}>
          <Sun className="mr-2 h-4 w-4" />
          Stone
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => setTheme("dark theme-stone")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark Stone
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light theme-rose")}>
          <Sun className="mr-2 h-4 w-4" />
          Rose
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark theme-rose")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark Rose
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
