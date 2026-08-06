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
  Sparkles,
  UserCircle,
  Zap,
  Store,
  Tag,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useTheme } from "@/lib/ThemeContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import GlobalSearch from "@/components/search/GlobalSearch";
import AnnouncementBar from "@/components/marketing/AnnouncementBar";
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

// ─── Instant Tooltip (no delay) ───────────────────────────────────────────────

function Tooltip({
  children,
  label,
  shortcut,
}: {
  children: React.ReactNode;
  label: string;
  shortcut?: string;
}) {
  return (
    <div className="group/tooltip relative">
      {children}
      <div className="pointer-events-none absolute -bottom-8 left-1/2 z-tooltip -translate-x-1/2 opacity-0 transition-none group-hover/tooltip:opacity-100">
        <div className="whitespace-nowrap rounded-lg border border-border/80 bg-foreground px-2.5 py-1.5 shadow-popover dark:border-border/60 dark:bg-muted">
          <span className="text-badge text-white dark:text-foreground">
            {label}
          </span>
          {shortcut && (
            <span className="ml-1.5 rounded-md bg-white/10 px-1 py-0.5 text-badge font-bold text-muted-foreground dark:bg-foreground/10 dark:text-muted-foreground">
              {shortcut}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="absolute -right-2 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-foreground to-muted-foreground px-1.5 text-badge font-bold leading-none text-white shadow-lg dark:from-foreground dark:to-muted-foreground dark:text-black"
    >
      {count > 9 ? "9+" : count}
    </motion.span>
  );
}

function UserAvatar({
  name,
  email,
  size = "md",
}: {
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initial = (name || email || "U").charAt(0).toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-lg",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-muted-foreground via-muted-foreground to-foreground font-bold text-white shadow-lg ring-2 ring-white/20 dark:from-muted dark:via-muted-foreground dark:to-muted dark:text-black dark:ring-black/10",
        sizes[size],
      )}
    >
      {initial}
    </div>
  );
}

// ─── Desktop User Dropdown ────────────────────────────────────────────────────

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
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/profile/orders", label: "Orders", icon: Package },
    { href: "/profile/addresses", label: "Addresses", icon: MapPin },
    { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-muted/80 dark:hover:bg-card/80"
      >
        <UserAvatar name={user.name} email={user.email} size="sm" />
        <div className="hidden text-left lg:block">
          <p className="text-body-sm font-bold text-foreground leading-tight">
            {user.name || "User"}
          </p>
          <p className="text-small text-muted-foreground leading-tight">
            {user.email || ""}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xl shadow-black/5 dark:border-border/50 dark:bg-foreground"
          >
            <div className="border-b border-border px-4 py-3 dark:border-border">
              <p className="text-sm font-bold text-foreground">
                {user.name || "User"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {user.email || ""}
              </p>
            </div>
            <div className="p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                >
                  <item.icon
                    size={18}
                    className="text-muted-foreground"
                  />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-border p-2 dark:border-border">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={18} />
                Sign Out
              </button>
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
            className="fixed inset-y-0 left-0 z-[100] w-[85vw] max-w-sm overflow-y-auto bg-white shadow-2xl dark:bg-foreground"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5 dark:border-border">
              <Link
                href="/"
                onClick={onClose}
                className="font-display text-title font-bold tracking-tighter text-foreground"
              >
                THRIFTX
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
              >
                <X size={22} />
              </button>
            </div>

            {user && (
              <div className="border-b border-border px-6 py-5 dark:border-border">
                <div className="flex items-center gap-4">
                  <UserAvatar name={user.name} email={user.email} size="md" />
                  <div>
                    <p className="text-base font-bold text-foreground">
                      {user.name || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="px-4 py-6">
              <p className="px-3 pb-3 text-caption text-muted-foreground">
                Shop
              </p>
              <div className="space-y-1">
                {navCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold transition-all",
                      cat.highlight
                        ? "bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800 hover:from-amber-100 hover:to-amber-200 dark:from-amber-900/20 dark:to-amber-900/10 dark:text-amber-300 dark:hover:from-amber-900/30 dark:hover:to-amber-900/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground",
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
                <p className="px-3 pb-3 text-caption text-muted-foreground">
                  Account
                </p>
                <div className="space-y-1">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                      >
                        <UserCircle size={22} /> My Profile
                      </Link>
                      <Link
                        href="/profile/orders"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                      >
                        <Package size={22} /> Orders
                      </Link>
                      <Link
                        href="/profile/wishlist"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                      >
                        <Heart size={22} /> Wishlist
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          onClose();
                        }}
                        className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut size={22} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl bg-foreground px-4 py-3.5 text-base font-semibold text-white transition hover:opacity-90 dark:bg-muted dark:text-foreground"
                      >
                        <User size={22} /> Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-muted-foreground transition hover:bg-muted dark:text-muted-foreground dark:hover:bg-card"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>

            <div className="border-t border-border px-6 py-5 dark:border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Appearance
                </span>
                <ThemeToggle size="md" />
              </div>
            </div>

            <div className="border-t border-border px-6 py-5 dark:border-border">
              <p className="text-small text-muted-foreground">
                Premium Thrift Fashion &mdash; THRIFTX
              </p>
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
    <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-white/80 px-5 backdrop-blur-xl dark:border-border dark:bg-foreground/80 sm:px-6 md:px-10 xl:px-16">
      <div className="flex items-center gap-4">
        <div className="h-6 w-6 animate-pulse rounded-lg bg-muted md:hidden" />
        <div className="hidden gap-8 md:flex">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 w-16 animate-pulse rounded bg-muted"
            />
          ))}
        </div>
      </div>
      <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-pulse rounded bg-muted" />
        <div className="h-6 w-6 animate-pulse rounded bg-muted" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      </div>
    </header>
  );
}

// ─── Main Header Component ────────────────────────────────────────────────────

export default function Header() {
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

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-50 flex h-20 w-full items-center justify-between",
          "border-b border-border/80 bg-white/90 px-5 backdrop-blur-2xl",
          "dark:border-border/50 dark:bg-foreground/90",
          "sm:px-6 md:px-10 xl:px-16",
          "shadow-sm",
          "transition-all duration-300",
        )}
      >
        {/* ── Left Section ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 md:gap-4">
          <Tooltip label="Menu">
            <motion.button
              whileTap={{ scale: 0.9 }}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition hover:bg-muted dark:text-muted-foreground dark:hover:bg-card md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </motion.button>
          </Tooltip>

          <Link
            href="/"
            className="hidden md:flex items-center gap-3 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-foreground via-muted-foreground to-muted-foreground text-body font-bold text-white shadow-popover transition-all group-hover:scale-105 group-hover:shadow-float dark:from-white dark:via-muted dark:to-muted-foreground dark:text-black">
              T
            </div>
            <div>
              <span className="font-display text-title font-bold tracking-tight text-foreground">
                THRIFTX
              </span>
              <span className="block text-badge font-bold uppercase tracking-widest text-muted-foreground leading-none">
                Premium Branded Thrift Clothing
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 ml-6 lg:flex">
            {navCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "group relative rounded-xl px-4 py-2.5 text-badge font-bold uppercase tracking-wider transition-all",
                  pathname === cat.href || pathname.startsWith(cat.href + "/")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground",
                  cat.highlight && "text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
                )}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
                {cat.badge && (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-badge font-bold uppercase tracking-wider text-white">
                    {cat.badge}
                  </span>
                )}
                {(pathname === cat.href || pathname.startsWith(cat.href + "/")) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 -z-10 rounded-2xl bg-muted"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/"
          className="flex flex-col items-center md:hidden"
        >
          <span className="font-display text-title font-bold tracking-tight text-foreground">
            THRIFTX
          </span>
          <span className="block text-badge font-bold uppercase tracking-widest text-muted-foreground leading-none mt-[-2px]">
            Premium Thrift
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="hidden md:block">
            <Tooltip label="Toggle theme">
              <ThemeToggle size="md" />
            </Tooltip>
          </div>

          <Tooltip label="Search products">
            <motion.button
              whileTap={{ scale: 0.9 }}
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
            >
              <Search size={22} />
            </motion.button>
          </Tooltip>

          <Tooltip label={totalItems > 0 ? `${totalItems} in cart` : "Cart"}>
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
            >
              <ShoppingBag size={22} />
              <CartBadge count={totalItems} />
            </Link>
          </Tooltip>

          <div className="hidden items-center md:flex">
            {user ? (
              <UserDropdown user={user} logout={logout} />
            ) : (
              <Tooltip label="Sign in">
                <Link
                  href="/login"
                  aria-label="Sign in to your account"
                  className="flex h-11 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-foreground to-muted-foreground px-5 text-sm font-bold text-white transition-all hover:from-muted-foreground hover:to-muted-foreground hover:shadow-lg hover:scale-105 dark:from-muted dark:to-muted dark:text-foreground dark:hover:from-foreground dark:hover:to-muted-foreground"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              </Tooltip>
            )}
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} logout={logout} />
    </>
  );
}
