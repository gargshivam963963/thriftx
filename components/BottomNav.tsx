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

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <nav className="md:hidden bg-white/80 backdrop-blur-xl fixed bottom-0 w-full z-50 rounded-t-2xl border-t border-border dark:border-border dark:bg-foreground/80 flex justify-around items-center h-16 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = "href" in item && pathname === item.href;
        const Icon = item.icon;

        if ("onClick" in item) {
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              title={item.tooltip}
              className="relative flex flex-col items-center group pt-1"
            >
              <Icon
                className={cn(
                  "w-6 h-6 mb-1 transition-all duration-200",
                  isActive
                    ? "text-black scale-110 dark:text-white"
                    : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-badge font-semibold tracking-wide uppercase transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href || "#"}
            title={item.tooltip}
            className="relative flex flex-col items-center group pt-1"
          >
            {item.badge && (
              <div className="absolute top-0 right-1/4 w-2 h-2 bg-error rounded-full border border-background"></div>
            )}
            <Icon
              className={cn(
                "w-6 h-6 mb-1 transition-all duration-200",
                isActive
                  ? "text-black scale-110 dark:text-white"
                  : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground",
              )}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={cn(
                "text-badge font-semibold tracking-wide uppercase transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Theme toggle as extra nav item */}
      <button
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="relative flex flex-col items-center group pt-1"
      >
        {theme === "dark" ? (
          <Sun className="w-6 h-6 mb-1 text-muted-foreground group-hover:scale-110 group-hover:text-foreground transition-all duration-200" strokeWidth={2} />
        ) : (
          <Moon className="w-6 h-6 mb-1 text-muted-foreground group-hover:scale-110 group-hover:text-foreground transition-all duration-200" strokeWidth={2} />
        )}
        <span className="text-badge font-semibold tracking-wide uppercase text-muted-foreground transition-colors">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      </button>
    </nav>
  );
}

