"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  // Hide bottom nav on admin routes
  if (pathname?.startsWith("/admin")) return null;

  const navItems: Array<
    | {
      href: string;
      icon: React.ElementType;
      label: string;
      tooltip: string;
      badge?: boolean;
    }
    | {
      onClick: () => void;
      icon: React.ElementType;
      label: string;
      tooltip: string;
    }
  > = [
      {
        href: "/",
        icon: Home,
        label: "Home",
        tooltip: "Go to homepage",
      },
      {
        href: "/shop",
        icon: Grid,
        label: "Shop",
        tooltip: "Browse all products",
      },
      {
        href: "/cart",
        icon: ShoppingBag,
        label: "Cart",
        tooltip: "View shopping cart",
        badge: true,
      },
      {
        href: "/profile/wishlist",
        icon: Heart,
        label: "Wishlist",
        tooltip: "View your wishlist",
      },
      user
        ? {
          onClick: logout,
          icon: LogOut,
          label: "Logout",
          tooltip: "Sign out of your account",
        }
        : {
          href: "/login",
          icon: User,
          label: "Profile",
          tooltip: "Sign in to your account",
        },
    ];

  return (
    <nav className="md:hidden bg-card/80 backdrop-blur-xl fixed bottom-0 w-full z-50 rounded-t-2xl border-t border-border dark:border-border dark:bg-card/80 flex items-center h-16 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = "href" in item && pathname === item.href;
        const Icon = item.icon;

        const iconClass = cn(
          "h-5 w-5 mb-0.5 transition-all duration-200 shrink-0",
          isActive
            ? "text-foreground scale-110"
            : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground",
        );
        const labelClass = cn(
          "text-badge font-semibold tracking-wide uppercase transition-colors whitespace-nowrap",
          isActive ? "text-foreground" : "text-muted-foreground",
        );

        if ("onClick" in item) {
          return (
            <Button
              key={item.label}
              onClick={item.onClick}
              title={item.tooltip}
              className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
            >
              <Icon className={iconClass} strokeWidth={isActive ? 2.5 : 2} />
              <span className={labelClass}>{item.label}</span>
            </Button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href || "#"}
            title={item.tooltip}
            className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
          >
            {item.badge && (
              <div className="absolute top-1 right-[calc(50%-16px)] h-2 w-2 rounded-full bg-error border border-background" />
            )}
            <Icon className={iconClass} strokeWidth={isActive ? 2.5 : 2} />
            <span className={labelClass}>{item.label}</span>
          </Link>
        );
      })}

      {/* Theme toggle as extra nav item — gated on mounted to avoid hydration mismatch */}
      <Button
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
      >
        {!mounted || theme === "light" ? (
          <Moon
            className="h-5 w-5 mb-0.5 text-muted-foreground group-hover:scale-110 group-hover:text-foreground transition-all duration-200 shrink-0"
            strokeWidth={2}
          />
        ) : (
          <Sun
            className="h-5 w-5 mb-0.5 text-muted-foreground group-hover:scale-110 group-hover:text-foreground transition-all duration-200 shrink-0"
            strokeWidth={2}
          />
        )}
        <span className="text-badge font-semibold tracking-wide uppercase text-muted-foreground transition-colors whitespace-nowrap">
          {!mounted || theme === "light" ? "Dark" : "Light"}
        </span>
      </Button>
    </nav>
  );
}
