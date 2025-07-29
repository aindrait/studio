
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

type Variant = "default" | "zinc" | "stone" | "rose"

type CustomThemeContextType = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  variant: Variant;
  setVariant: (variant: Variant) => void;
};

const CustomThemeContext = React.createContext<CustomThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}

function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  const [variant, setVariant] = React.useState<Variant>("default");

  React.useEffect(() => {
    try {
        const storedVariant = localStorage.getItem("theme-variant") as Variant | null;
        if (storedVariant && ["default", "zinc", "stone", "rose"].includes(storedVariant)) {
            setVariant(storedVariant);
        }
    } catch (e) {
        console.error("Failed to access localStorage for theme variant.");
    }
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("theme-zinc", "theme-stone", "theme-rose");

    if (variant !== "default") {
      root.classList.add(`theme-${variant}`);
       try {
            localStorage.setItem("theme-variant", variant);
       } catch (e) {
            console.error("Failed to set theme variant in localStorage.");
       }
    } else {
       try {
            localStorage.removeItem("theme-variant");
       } catch (e) {
           console.error("Failed to remove theme variant from localStorage.");
       }
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
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
