"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
