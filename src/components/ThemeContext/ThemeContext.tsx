"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "dark"; // Fixed dark theme

interface ThemeContextProps {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "dark",
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Force dark theme for now.
    setTheme("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
