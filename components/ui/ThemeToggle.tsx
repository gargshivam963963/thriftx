"use client";

import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme, type ThemePreference } from "@/lib/ThemeContext";
import { cn } from "@/lib/utils";
import {
    menuVariants,
    press,
} from "@/components/animations/Motion";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "dropdown" | "segmented" | "select";
}

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function ThemeToggle({
  className,
  size = "md",
  variant = "dropdown",
}: ThemeToggleProps) {
  const { preference, setTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Fallback while not mounted to prevent hydration mismatch
  if (!mounted) {
    if (variant === "segmented") {
      return (
        <div
          className={cn(
            "flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1",
            className,
          )}
        >
          {THEME_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground"
            >
              <opt.icon size={14} />
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      );
    }

    if (variant === "select") {
      return (
        <select
          disabled
          aria-label="Color theme"
          className={cn(
            "min-w-0 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground opacity-70",
            size === "sm" ? "h-9" : size === "lg" ? "h-12" : "h-10",
            className,
          )}
        >
          <option value="system">System (Auto)</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      );
    }

    return (
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground",
          className,
        )}
      >
        <Sun size={20} strokeWidth={2} />
      </div>
    );
  }

  // Segmented Pill Variant (for Sidebar, Mobile Menu, Profile Settings)
  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Theme preference"
        className={cn(
          "flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1",
          className,
        )}
      >
        {THEME_OPTIONS.map((opt) => {
          const isSelected = preference === opt.value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold leading-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <Icon size={14} className="shrink-0" />
              <span>{opt.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="activeThemePill"
                  className="absolute inset-0 -z-10 rounded-lg bg-card"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Native Select Variant
  if (variant === "select") {
    return (
      <select
        value={preference}
        onChange={(event) => {
          const value = event.target.value as ThemePreference;
          if (value === "system" || value === "light" || value === "dark") {
            setTheme(value);
          }
        }}
        aria-label="Color theme"
        title="Color theme"
        className={cn(
          "min-w-0 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          size === "sm" ? "h-9" : size === "lg" ? "h-12" : "h-10",
          className,
        )}
      >
        <option value="system">System (Auto)</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    );
  }

  // Dropdown Variant (Default for Header and Navbars)
  const CurrentIcon =
    preference === "system"
      ? Laptop
      : preference === "dark"
        ? Moon
        : Sun;

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <motion.button
        type="button"
        whileTap={press.iconTap}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Current theme: ${preference}. Click to change theme`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-card",
          size === "sm" ? "h-9 w-9" : size === "lg" ? "h-12 w-12" : "h-11 w-11",
        )}
      >
        <CurrentIcon size={20} strokeWidth={2} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full z-50 mt-2 w-44 origin-top-right overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-float"
          >
            <div className="px-2.5 py-1.5 text-caption text-muted-foreground">
              Theme
            </div>
            {THEME_OPTIONS.map((opt) => {
              const isSelected = preference === opt.value;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setTheme(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "bg-accent/10 font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="shrink-0" />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-foreground" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
