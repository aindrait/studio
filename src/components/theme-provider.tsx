
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
    const { theme, setTheme: setBaseTheme, ...rest } = useNextTheme();
    const [variant, setVariant] = React.useState<string | null>(null);

    React.useEffect(() => {
        // On initial load, try to read the variant from local storage.
        const storedVariant = localStorage.getItem('theme-variant');
        if (storedVariant) {
            setVariant(storedVariant);
        }
    }, []);

    React.useEffect(() => {
        // When the variant changes, update the class on the html element and in local storage.
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
        
        // This only passes "light" or "dark" to next-themes
        setBaseTheme(newBaseTheme);

        // This manages our variant class
        setVariant(newVariant || null);
    };

    return { ...rest, theme: `${theme} ${variant || ''}`.trim(), setTheme };
}
