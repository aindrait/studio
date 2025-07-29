
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
    const { theme: baseTheme, setTheme: setBaseTheme, ...rest } = useNextTheme();
    const [variant, setVariant] = React.useState<string | null>(null);

    React.useEffect(() => {
        const storedVariant = localStorage.getItem('theme-variant');
        if (storedVariant) {
            setVariant(storedVariant);
        }
    }, []);

    React.useEffect(() => {
        document.documentElement.classList.remove('theme-zinc', 'theme-stone', 'theme-rose');
        if (variant) {
            document.documentElement.classList.add(variant);
            localStorage.setItem('theme-variant', variant);
        } else {
             localStorage.removeItem('theme-variant');
        }
    }, [variant]);


    const setTheme = (newTheme: string) => {
        const [newBaseTheme, newVariant] = newTheme.split(' ');
        setBaseTheme(newBaseTheme);
        setVariant(newVariant || null);
    };

    return { ...rest, theme: baseTheme, setTheme };
}
