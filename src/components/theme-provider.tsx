"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

function CustomThemeProvider({ children, ...props }: ThemeProviderProps) {
  // We must remove the value and attribute props to prevent passing invalid theme strings
  // like "light theme-zinc" to the underlying provider, which causes the DOMTokenList error.
  const { value, attribute, ...rest } = props;
  return <NextThemesProvider {...rest} attribute="class">{children}</NextThemesProvider>
}

export { CustomThemeProvider as ThemeProvider }

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
            document.documentElement.classList.add(`theme-${variant}`);
            localStorage.setItem('theme-variant', variant);
        } else {
             localStorage.removeItem('theme-variant');
        }
    }, [variant, baseTheme]);


    const setTheme = (newTheme: string) => {
        const [newBaseTheme, newVariant] = newTheme.split(' ');
        
        if (newBaseTheme === 'light' || newBaseTheme === 'dark' || newBaseTheme === 'system') {
            setBaseTheme(newBaseTheme);
        }

        setVariant(newVariant ? newVariant.replace('theme-', '') : null);
    };
    
    const theme = variant ? `${baseTheme} theme-${variant}` : baseTheme;

    return { ...rest, theme, setTheme };
}
