
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const { theme, setTheme, ...rest } = useNextTheme();
  const [variant, setVariant] = React.useState<string>('default');

  React.useEffect(() => {
    // Saat komponen dimuat, baca varian dari localStorage
    const storedVariant = localStorage.getItem('theme-variant');
    if (storedVariant) {
      setVariant(storedVariant);
    }
  }, []);

  React.useEffect(() => {
    const rootEl = document.documentElement;
    
    // Hapus semua kelas varian tema yang sudah ada
    const themeClasses = Array.from(rootEl.classList).filter(c => c.startsWith('theme-'));
    rootEl.classList.remove(...themeClasses);

    // Tambahkan kelas varian tema yang baru jika bukan 'default'
    if (variant !== 'default') {
      rootEl.classList.add(`theme-${variant}`);
      localStorage.setItem('theme-variant', variant);
    } else {
      localStorage.removeItem('theme-variant');
    }
  }, [variant]);

  return { 
    ...rest, 
    theme, // Ini akan menjadi 'light', 'dark', atau 'system'
    setTheme, // Fungsi untuk mengubah tema dasar
    variant, // Ini akan menjadi 'default', 'zinc', dll.
    setVariant // Fungsi untuk mengubah varian warna
  };
}
