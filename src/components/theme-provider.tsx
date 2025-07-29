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
  const [variant, setVariant] = React.useState<string>('default');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedVariant = localStorage.getItem('theme-variant');
    if (storedVariant) {
      setVariant(storedVariant);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use <html> if in top-level context, fallback to <body> in iframe/sandbox
    const rootEl = window === window.parent ? document.documentElement : document.body;

    // Remove all known variant classes
    rootEl.classList.remove('theme-zinc', 'theme-stone', 'theme-rose');

    // Add current variant class if applicable
    if (variant !== 'default') {
      try {
        rootEl.classList.add(`theme-${variant}`);
        localStorage.setItem('theme-variant', variant);
      } catch (e) {
        console.warn("Error applying theme variant:", e);
      }
    } else {
      localStorage.removeItem('theme-variant');
    }
  }, [variant]);

  const setTheme = (newTheme: string) => {
    // Accept format like "light theme-zinc" or "dark"
    const parts = newTheme.split(' ');
    const newBaseTheme = parts[0];
    const newVariantRaw = parts.find(p => p.startsWith('theme-'));
    const newVariant = newVariantRaw?.replace('theme-', '') || 'default';

    if (['light', 'dark', 'system'].includes(newBaseTheme)) {
      setBaseTheme(newBaseTheme);
    } else {
      console.warn(`Invalid base theme: ${newBaseTheme}`);
    }

    setVariant(newVariant);
  };

  const theme = variant !== 'default' ? `${baseTheme} theme-${variant}` : baseTheme;

  return { ...rest, theme, setTheme };
}
