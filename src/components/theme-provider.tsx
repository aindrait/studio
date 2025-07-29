
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const { theme: baseTheme, setTheme: setBaseTheme, ...rest } = useNextTheme();
  const [variant, setVariant] = React.useState<string>('default');

  React.useEffect(() => {
    // On mount, read the variant from localStorage
    const storedVariant = localStorage.getItem('theme-variant');
    if (storedVariant) {
      setVariant(storedVariant);
    }
  }, []);

  React.useEffect(() => {
    const rootEl = document.documentElement;
    
    // Remove any existing theme- variant classes
    const themeClasses = Array.from(rootEl.classList).filter(c => c.startsWith('theme-'));
    rootEl.classList.remove(...themeClasses);

    // Add the new theme variant class if it's not 'default'
    if (variant !== 'default') {
      rootEl.classList.add(`theme-${variant}`);
      localStorage.setItem('theme-variant', variant);
    } else {
      localStorage.removeItem('theme-variant');
    }
  }, [variant]);

  return { 
    ...rest, 
    theme: baseTheme, // This will be 'light', 'dark', or 'system'
    setTheme: setBaseTheme, // Function to change base theme
    variant, // This will be 'default', 'zinc', etc.
    setVariant // Function to change the color variant
  };
}
