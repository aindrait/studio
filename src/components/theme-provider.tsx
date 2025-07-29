"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

function CustomThemeProvider({ children, ...props }: ThemeProviderProps) {
  // We are stripping out the `value` and `attribute` props to avoid passing an invalid value
  // like "light theme-zinc" to the underlying provider, which causes the DOMTokenList error.
  const { value, attribute, ...rest } = props;
  return <NextThemesProvider {...rest} attribute="class">{children}</NextThemesProvider>
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

    const rootEl = document.documentElement;
    rootEl.classList.remove('theme-zinc', 'theme-stone', 'theme-rose');

    if (variant !== 'default') {
      rootEl.classList.add(`theme-${variant}`);
      localStorage.setItem('theme-variant', variant);
    } else {
      localStorage.removeItem('theme-variant');
    }
  }, [variant]);

  const setTheme = (newTheme: string) => {
    const parts = newTheme.split(' ');
    const newBaseTheme = parts[0];
    const newVariantRaw = parts.find(p => p.startsWith('theme-'));
    const newVariant = newVariantRaw?.replace('theme-', '') || 'default';

    if (['light', 'dark', 'system'].includes(newBaseTheme)) {
      setBaseTheme(newBaseTheme);
    }

    setVariant(newVariant);
  };

  const theme = variant !== 'default' ? `${baseTheme} theme-${variant}` : baseTheme;

  return { ...rest, theme, setTheme, baseTheme, variant };
}
