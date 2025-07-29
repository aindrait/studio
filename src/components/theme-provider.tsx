"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

type Variant = "default" | "zinc" | "stone" | "rose"

type ThemeContextType = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  variant: Variant;
  setVariant: (variant: Variant) => void;
};

const CustomThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useNextTheme();
  const [variant, setVariant] = React.useState<Variant>("default");

  React.useEffect(() => {
    const storedVariant = localStorage.getItem("theme-variant") as Variant | null;
    if (storedVariant) {
      setVariant(storedVariant);
    }
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any existing theme- variant classes
    const themeClasses = Array.from(root.classList).filter(c => c.startsWith('theme-'));
    root.classList.remove(...themeClasses);

    if (variant !== "default") {
      root.classList.add(`theme-${variant}`);
      localStorage.setItem("theme-variant", variant);
    } else {
      localStorage.removeItem("theme-variant");
    }
  }, [variant]);
  
  const value = React.useMemo(() => ({
      theme,
      setTheme,
      variant,
      setVariant: (v: Variant) => setVariant(v),
  }), [theme, setTheme, variant]);

  return (
    <CustomThemeContext.Provider value={value}>
      {children}
    </CustomThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a CustomThemeProvider");
  }
  return context;
};
