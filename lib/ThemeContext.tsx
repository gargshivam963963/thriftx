"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

interface ThemeContextType {
    theme: Theme;
    preference: ThemePreference;
    toggleTheme: () => void;
    setTheme: (theme: ThemePreference) => void;
    /** True only after the client has mounted and the actual theme is known. */
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    preference: "system",
    toggleTheme: () => { },
    setTheme: () => { },
    mounted: false,
});

const STORAGE_KEY = "thriftx_theme";

function getInitialTheme(): ThemePreference {
    if (typeof window === "undefined") return "system";

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "dark" || stored === "light" || stored === "system") {
            return stored;
        }
    } catch { }

    return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [preference, setPreference] = useState<ThemePreference>("system");
    const [systemTheme, setSystemTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);
    const theme =
        preference === "system" ? systemTheme : preference;

    useEffect(() => {
        setPreference(getInitialTheme());
        setSystemTheme(
            window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light",
        );
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);

        try {
            window.localStorage.setItem(STORAGE_KEY, preference);
        } catch { }
    }, [theme, preference, mounted]);

    const toggleTheme = useCallback(() => {
        setPreference((current) =>
            current === "system"
                ? "light"
                : current === "light"
                    ? "dark"
                    : "system",
        );
    }, []);

    const setTheme = useCallback((newTheme: ThemePreference) => {
        setPreference(newTheme);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) =>
            setSystemTheme(e.matches ? "dark" : "light");

        mql.addEventListener("change", handleChange);
        return () => mql.removeEventListener("change", handleChange);
    }, []);

    return (
        <ThemeContext.Provider
            value={{ theme, preference, toggleTheme, setTheme, mounted }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
