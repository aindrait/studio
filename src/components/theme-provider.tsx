"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

function CustomThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props} attribute="class">{children}</NextThemesProvider>
}

export { CustomThemeProvider as ThemeProvider }

export function useTheme() {
    const { theme: baseTheme, setTheme: setBaseTheme, ...rest } = useNextTheme();
    const [variant, setVariant] = React.useState<string | null>(null);

    React.useEffect(() => {
        const storedVariant = localStorage.getItem('theme-variant');
        if (storedVariant) {
            setVariant(storedVariant);
        } else {
             // If no variant is stored, default to 'default' which has no class
             setVariant('default');
        }
    }, []);

    React.useEffect(() => {
        // Remove all theme-variant classes
        document.documentElement.classList.remove('theme-zinc', 'theme-stone', 'theme-rose');
        
        // Add the current variant's class if it's not the default
        if (variant && variant !== 'default') {
            document.documentElement.classList.add(`theme-${variant}`);
            localStorage.setItem('theme-variant', variant);
        } else {
            localStorage.removeItem('theme-variant');
        }
    }, [variant]);


    const setTheme = (newTheme: string) => {
        // The theme string can be "light", "dark", or "light theme-zinc"
        const [newBaseTheme, ...variantParts] = newTheme.split(' ');
        const newVariant = variantParts.join(' ').replace('theme-','');
        
        if (newBaseTheme === 'light' || newBaseTheme === 'dark' || newBaseTheme === 'system') {
            setBaseTheme(newBaseTheme);
        }

        setVariant(newVariant || 'default');
    };
    
    const theme = variant && variant !== 'default' ? `${baseTheme} theme-${variant}` : baseTheme;

    return { ...rest, theme, setTheme };
}
