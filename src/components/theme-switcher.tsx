
"use client"

import * as React from "react"
import { useTheme } from "@/components/theme-provider"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Palette } from "lucide-react"

export function ThemeSwitcher() {
  const { setTheme, setVariant, variant, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
           <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
           <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                <span>Mode</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        System
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
         <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                <span>Color Scheme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setVariant("default")}>
                        Default
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setVariant("zinc")}>
                        Zinc
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setVariant("stone")}>
                        Stone
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setVariant("rose")}>
                        Rose
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
