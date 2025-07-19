
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Theme, ThemeProviderState, initialState } from "./ThemeProvider.utils";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Determine actual theme (resolving system preference if needed)
    const resolvedTheme = theme === "system" 
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;
    
    // Set the data-theme attribute and class
    root.setAttribute("data-theme", resolvedTheme);
    root.classList.add(resolvedTheme);
    
    // Apply theme to important elements
    document.body.setAttribute('data-theme', resolvedTheme);
    
    // Dispatch an event so components can react to the theme change
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { theme: resolvedTheme } 
    }));
  }, [theme]);

  useEffect(() => {
    // Add event listener for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const newTheme = mediaQuery.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newTheme);
        document.body.setAttribute('data-theme', newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
