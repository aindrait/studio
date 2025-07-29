"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}


export function useTheme() {
    const { theme, setTheme, ...rest } = useNextTheme();

    React.useEffect(() => {
        if (theme) {
            const [baseTheme, themeVariant] = theme.split(' ');
            document.documentElement.classList.remove('theme-zinc', 'theme-stone', 'theme-rose');
            if (themeVariant) {
                document.documentElement.classList.add(themeVariant);
            }
        }
    }, [theme]);

    const customSetTheme = (newTheme: string) => {
        const [baseTheme, themeVariant] = newTheme.split(' ');
        
        // Always set the full theme string to next-themes state
        setTheme(newTheme);

        // Manually update the document classes
        document.documentElement.classList.remove('theme-zinc', 'theme-stone', 'theme-rose');
        if (themeVariant) {
            document.documentElement.classList.add(themeVariant);
        }
        // Set the base theme class (light/dark) via next-themes
        // next-themes will handle the 'light' or 'dark' class on the html element
        // by just setting the base theme.
        setTheme(baseTheme);
    };
    
    // The custom setter is what we expose.
    // The `theme` from `useNextTheme` will just be 'light' or 'dark' after our custom logic runs.
    return { ...rest, theme, setTheme: customSetTheme };
}
