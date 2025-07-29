"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}


export function useTheme() {
    const { theme, setTheme, ...rest } = useNextTheme();
    const [variant, setVariant] = React.useState('default');

    React.useEffect(() => {
        if (theme) {
            const [baseTheme, themeVariant] = theme.split(' ');
            document.documentElement.classList.remove('theme-zinc', 'theme-stone', 'theme-rose');

            if (themeVariant) {
                document.documentElement.classList.add(themeVariant);
                setVariant(themeVariant);
            } else {
                 setVariant('default');
            }
        }
    }, [theme]);


    const customSetTheme = (newTheme: string) => {
        const [base, v] = newTheme.split(' ');
        if (v) {
            setTheme(newTheme);
        } else {
            const currentVariant = Array.from(document.documentElement.classList).find(c => c.startsWith('theme-'));
            if(currentVariant) {
                 setTheme(`${newTheme} ${currentVariant}`);
            } else {
                 setTheme(newTheme);
            }
        }
    };
    
    return { ...rest, theme, setTheme: customSetTheme };
}