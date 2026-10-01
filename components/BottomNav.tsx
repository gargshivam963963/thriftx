"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid,
  ShoppingBag,
  Heart,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/ThemeContext";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();

  // Hide bottom nav on admin routes
  if (pathname?.startsWith("/admin")) return null;

  const navItems = [
    { href: "/", icon: Home, label: "Home", tooltip: "Go to homepage" },
    { href: "/shop", icon: Grid, label: "Shop", tooltip: "Browse products" },
    { href: "/cart", icon: ShoppingBag, label: "Cart", tooltip: "View cart", badge: true },
    { href: "/profile/wishlist", icon: Heart, label: "Wishlist", tooltip: "View wishlist" },
  ];
  const ThemeIcon = !mounted || theme === "light" ? Moon : Sun;
  const themeAction = theme === "dark" ? "Light" : "Dark";

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-5 items-stretch border-t border-border bg-card/95 px-1 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl md:hidden"
    >
      {navItems.map((item) => {
        const isWishlist = item.href === "/profile/wishlist";
        const isProfile = item.href === "/profile";
        const isActive =
          pathname === item.href ||
          (item.href === "/shop" && pathname.startsWith("/shop/")) ||
          (isWishlist && pathname.startsWith("/profile/wishlist")) ||
          (isProfile &&
            pathname.startsWith("/profile") &&
            !pathname.startsWith("/profile/wishlist"));
        const Icon = item.icon;

        const iconClass = cn(
          "h-5 w-5 shrink-0 transition-colors duration-200",
          isActive
            ? "text-foreground"
            : "text-muted-foreground group-hover:text-foreground",
        );

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.tooltip}
            aria-current={isActive ? "page" : undefined}
            title={item.tooltip}
            className={cn(
              "group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold uppercase leading-none tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.badge && (
              <span className="absolute left-1/2 top-2 ml-3 h-2 w-2 rounded-full border border-background bg-error" />
            )}
            <Icon className={iconClass} strokeWidth={isActive ? 2.25 : 1.9} aria-hidden="true" />
            <span className="block max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        rounded="lg"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-pressed={theme === "dark"}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={toggleTheme}
        className="group flex h-full w-full min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold uppercase leading-none tracking-normal"
      >
        <ThemeIcon
          className="h-5 w-5 shrink-0 transition-colors duration-200"
          strokeWidth={1.9}
          aria-hidden="true"
        />
        <span className="block max-w-full truncate">{themeAction}</span>
      </Button>
    </nav>
  );
}
