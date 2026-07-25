"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => { },
    setTheme: () => { },
});

const STORAGE_KEY = "thriftx_theme";

function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "light";

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "dark" || stored === "light") return stored;
    } catch { }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);
    const [mounted, setMounted] = useState(false);

    if (!mounted) setMounted(true);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);

        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch { }
    }, [theme, mounted]);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                setThemeState(e.matches ? "dark" : "light");
            }
        };

        mql.addEventListener("change", handleChange);
        return () => mql.removeEventListener("change", handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);

