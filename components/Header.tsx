"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  LogOut,
  X,
  Heart,
  Package,
  MapPin,
  ChevronDown,
  UserCircle,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import GlobalSearch from "@/components/search/GlobalSearch";
import AnnouncementBar from "@/components/marketing/AnnouncementBar";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavCategory {
  label: string;
  href: string;
  icon: string;
  highlight?: boolean;
  badge?: string;
}

// ─── Modern Product-Focused Categories ────────────────────────────────────────

const navCategories: NavCategory[] = [
  { label: "New Arrivals", href: "/shop?sort=newest", icon: "🔥" },
  { label: "Vintage", href: "/shop/vintage", icon: "✨" },
  { label: "Best Sellers", href: "/shop?sort=popular", icon: "⭐" },
  { label: "Sale", href: "/shop?sort=sale", icon: "🏷️", highlight: true, badge: "UP TO 60%" },
];

// ─── Tooltip (Shared, consistent) ─────────────────────────────────────────────

function Tooltip({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="group/tooltip relative">
      {children}
      <div className="pointer-events-none absolute -bottom-9 left-1/2 z-tooltip -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/tooltip:opacity-100">
        <div className="whitespace-nowrap rounded-lg border border-border/80 bg-foreground px-2.5 py-1.5 shadow-popover dark:bg-muted dark:text-foreground">
          <span className="text-badge text-background dark:text-foreground">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Badge ───────────────────────────────────────────────────────────────

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-foreground px-1 text-badge font-bold leading-none text-background dark:bg-muted dark:text-foreground"
    >
      {count > 9 ? "9+" : count}
    </motion.span>
  );
}

// ─── Compact User Avatar ──────────────────────────────────────────────────────

function UserAvatar({
  name,
  email,
  size = "sm",
}: {
  name?: string;
  email?: string;
  size?: "sm" | "md";
}) {
  const initial = (name || email || "U").charAt(0).toUpperCase();
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-10 w-10 text-sm",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-foreground font-bold text-background ring-2 ring-border dark:bg-muted dark:text-foreground",
        sizes[size],
      )}
    >
      {initial}
    </div>
  );
}

// ─── Desktop User Dropdown (email only inside) ────────────────────────────────

function UserDropdown({
  user,
  logout,
}: {
  user: { $id: string; name?: string; email?: string };
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { href: "/profile", label: "Profile", icon: UserCircle },
    { href: "/profile/orders", label: "Orders", icon: Package },
    { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
    { href: "/profile/addresses", label: "Addresses", icon: MapPin },
    { href: "/profile/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-muted dark:hover:bg-card"
      >
        <UserAvatar name={user.name} email={user.email} size="sm" />
        <ChevronDown
          size={14}
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full bg-card p-0.5 text-muted-foreground shadow-card transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-float dark:bg-card"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-body font-bold text-foreground">
                {user.name || "User"}
              </p>
              <p className="mt-0.5 truncate text-small text-muted-foreground">
                {user.email || ""}
              </p>
            </div>
            <div className="p-1.5">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <item.icon size={17} className="text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
              <div className="my-1.5 h-px bg-border" />
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-error transition hover:bg-error-bg/50"
              >
                <LogOut size={17} />
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
  user,
  logout,
}: {
  open: boolean;
  onClose: () => void;
  user: { $id: string; name?: string; email?: string } | null;
  logout: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-[100] w-[85vw] max-w-sm overflow-y-auto bg-background shadow-2xl dark:bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <Link
                href="/"
                onClick={onClose}
                className="font-display text-title font-bold tracking-tighter text-foreground"
              >
                THRIFTX
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={22} />
              </Button>
            </div>

            {user && (
              <div className="border-b border-border px-6 py-5">
                <div className="flex items-center gap-4">
                  <UserAvatar name={user.name} email={user.email} size="md" />
                  <div>
                    <p className="text-body font-bold text-foreground">
                      {user.name || "User"}
                    </p>
                    <p className="text-small text-muted-foreground">
                      {user.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="px-4 py-6">
              <p className="px-3 pb-3 text-caption text-muted-foreground">Shop</p>
              <div className="space-y-1">
                {navCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold transition-all",
                      cat.highlight
                        ? "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    {cat.label}
                    {cat.badge && (
                      <span className="ml-auto rounded-full bg-amber-500 px-2.5 py-0.5 text-badge font-bold uppercase tracking-wider text-white">
                        {cat.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-8">
                <p className="px-3 pb-3 text-caption text-muted-foreground">Account</p>
                <div className="space-y-1">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <UserCircle size={22} /> My Profile
                      </Link>
                      <Link
                        href="/profile/orders"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Package size={22} /> Orders
                      </Link>
                      <Link
                        href="/profile/wishlist"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Heart size={22} /> Wishlist
                      </Link>
                      <Button
                        type="button"
                        onClick={() => {
                          logout();
                          onClose();
                        }}
                        className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-error transition hover:bg-error-bg/50"
                      >
                        <LogOut size={22} /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={onClose}>
                        <Button size="lg" fullWidth>
                          <User size={18} /> Sign In
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={onClose}>
                        <Button variant="outline" size="lg" fullWidth>
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-muted-foreground">
                  Appearance
                </span>
                <ThemeToggle size="md" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Header Skeleton ──────────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-header h-header w-full border-b border-border bg-background/90 backdrop-blur-xl dark:bg-background/90">
      <Container className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 animate-pulse rounded-lg bg-muted md:hidden" />
          <div className="hidden md:flex items-center gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-pulse rounded bg-muted" />
          <div className="h-6 w-6 animate-pulse rounded bg-muted" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        </div>
      </Container>
    </header>
  );
}

// ─── Header Icon Button (consistent) ──────────────────────────────────────────

function IconButton({
  onClick,
  label,
  icon,
}: {
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-card"
    >
      {icon}
    </motion.button>
  );
}

// ─── Main Header Component ────────────────────────────────────────────────────

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const { totalItems } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;
  if (loading) return <HeaderSkeleton />;

  const iconSize = 20;
  const iconStroke = 2;

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-header h-header w-full border-b border-border/80",
          "bg-background/90 backdrop-blur-2xl",
          "dark:bg-background/90 dark:border-border/50",
          "shadow-sm",
          "transition-all duration-300",
        )}
      >
        <Container className="flex h-full items-center justify-between gap-4">
          {/* ── Left: Menu (mobile) ─────────────────────────────── */}
          <div className="flex items-center gap-1 lg:hidden">
            <IconButton
              label="Open menu"
              icon={<Menu size={iconSize} strokeWidth={iconStroke} />}
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>

          {/* ── Logo ────────────────────────────────────────────── */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-body font-bold text-background shadow-popover transition-transform group-hover:scale-105 dark:bg-muted dark:text-foreground">
              T
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-title font-bold tracking-tight text-foreground leading-none">
                THRIFTX
              </span>
              <span className="block text-badge font-bold uppercase tracking-widest text-muted-foreground leading-tight">
                Premium Thrift
              </span>
            </div>
          </Link>

          {/* ── Navigation (desktop) ────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "relative whitespace-nowrap rounded-xl px-3.5 py-2 text-label font-semibold transition-colors",
                  pathname === cat.href || pathname.startsWith(cat.href.split("?")[0] + "/")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  cat.highlight && "text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
                )}
              >
                {cat.label}
                {cat.badge && (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-badge font-bold uppercase tracking-wider text-white">
                    {cat.badge}
                  </span>
                )}
                {(pathname === cat.href || pathname.startsWith(cat.href.split("?")[0] + "/")) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 -z-10 rounded-xl bg-muted dark:bg-card"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right: icons + auth ─────────────────────────────── */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <div className="hidden md:block">
              <Tooltip label="Toggle theme">
                <ThemeToggle size="md" />
              </Tooltip>
            </div>

            <Tooltip label="Search products">
              <IconButton
                label="Search products"
                icon={<Search size={iconSize} strokeWidth={iconStroke} />}
                onClick={() => setSearchOpen(true)}
              />
            </Tooltip>

            <Tooltip label={totalItems > 0 ? `${totalItems} in cart` : "Cart"}>
              <Link
                href="/cart"
                aria-label="Shopping cart"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-card"
              >
                <ShoppingBag size={iconSize} strokeWidth={iconStroke} />
                <CartBadge count={totalItems} />
              </Link>
            </Tooltip>

            <div className="hidden items-center md:flex ml-1">
              {user ? (
                <UserDropdown user={user} logout={logout} />
              ) : (
                <Tooltip label="Sign in">
                  <Button
                    onClick={() => router.push("/login")}
                    variant="primary"
                    size="md"
                  >
                    <User size={iconSize} strokeWidth={iconStroke} />
                    Sign In
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </Container>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} logout={logout} />
    </>
  );
}
