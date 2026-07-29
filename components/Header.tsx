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
      <div className="pointer-events-none absolute -bottom-8 left-1/2 z-[60] -translate-x-1/2 opacity-0 transition-none group-hover/tooltip:opacity-100">
        <div className="whitespace-nowrap rounded-lg border border-neutral-200/80 bg-neutral-900 px-2.5 py-1.5 shadow-xl dark:border-neutral-700/60 dark:bg-neutral-100">
          <span className="text-[10px] font-semibold text-white dark:text-neutral-900">
            {label}
          </span>
          {shortcut && (
            <span className="ml-1.5 rounded-md bg-white/10 px-1 py-0.5 text-[9px] font-bold text-neutral-400 dark:bg-neutral-900/10 dark:text-neutral-500">
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
      className="absolute -right-2 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-neutral-900 to-neutral-700 px-1.5 text-[10px] font-bold leading-none text-white shadow-lg dark:from-white dark:to-neutral-300 dark:text-black"
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
        "flex items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 font-bold text-white shadow-lg ring-2 ring-white/20 dark:from-neutral-200 dark:via-neutral-300 dark:to-neutral-100 dark:text-black dark:ring-black/10",
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
        className="flex items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80"
      >
        <UserAvatar name={user.name} email={user.email} size="sm" />
        <div className="hidden text-left lg:block">
          <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
            {user.name || "User"}
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
            {user.email || ""}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-neutral-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl shadow-black/5 dark:border-neutral-700/50 dark:bg-neutral-900"
          >
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {user.name || "User"}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {user.email || ""}
              </p>
            </div>
            <div className="p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  <item.icon
                    size={18}
                    className="text-neutral-400 dark:text-neutral-500"
                  />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-neutral-100 p-2 dark:border-neutral-800">
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
            className="fixed inset-y-0 left-0 z-[100] w-[85vw] max-w-sm overflow-y-auto bg-white shadow-2xl dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">
              <Link
                href="/"
                onClick={onClose}
                className="font-serif text-[clamp(1.25rem,4vw,1.75rem)] font-bold tracking-tighter text-neutral-900 dark:text-neutral-100"
              >
                THRIFTX
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <X size={22} />
              </button>
            </div>

            {user && (
              <div className="border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">
                <div className="flex items-center gap-4">
                  <UserAvatar name={user.name} email={user.email} size="md" />
                  <div>
                    <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {user.name || "User"}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {user.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="px-4 py-6">
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
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
                        : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    {cat.label}
                    {cat.badge && (
                      <span className="ml-auto rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        {cat.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-8">
                <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Account
                </p>
                <div className="space-y-1">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                      >
                        <UserCircle size={22} /> My Profile
                      </Link>
                      <Link
                        href="/profile/orders"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                      >
                        <Package size={22} /> Orders
                      </Link>
                      <Link
                        href="/profile/wishlist"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
                        className="flex items-center gap-4 rounded-2xl bg-neutral-900 px-4 py-3.5 text-base font-semibold text-white transition hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
                      >
                        <User size={22} /> Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>

            <div className="border-t border-neutral-100 px-6 py-5 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Appearance
                </span>
                <ThemeToggle size="md" />
              </div>
            </div>

            <div className="border-t border-neutral-100 px-6 py-5 dark:border-neutral-800">
              <p className="text-xs text-neutral-400">
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
    <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-neutral-100 bg-white/80 px-5 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80 sm:px-6 md:px-10 xl:px-16">
      <div className="flex items-center gap-4">
        <div className="h-6 w-6 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700 md:hidden" />
        <div className="hidden gap-8 md:flex">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
            />
          ))}
        </div>
      </div>
      <div className="h-9 w-36 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
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
      <header
        className={cn(
          "fixed top-0 z-50 flex h-20 w-full items-center justify-between",
          "border-b border-neutral-100/80 bg-white/90 px-5 backdrop-blur-2xl",
          "dark:border-neutral-800/50 dark:bg-neutral-900/90",
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
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </motion.button>
          </Tooltip>

          <Link
            href="/"
            className="hidden md:flex items-center gap-3 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 text-base font-bold text-white shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl dark:from-white dark:via-neutral-200 dark:to-neutral-300 dark:text-black">
              T
            </div>
            <div>
              <span className="font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                THRIFTX
              </span>
              <span className="block text-[clamp(7px,0.6vw,9px)] font-bold uppercase tracking-[0.25em] text-neutral-400 leading-none">
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
                  "group relative rounded-2xl px-4 py-2.5 text-[clamp(10px,0.7vw,12px)] font-bold uppercase tracking-[0.12em] transition-all",
                  pathname === cat.href || pathname.startsWith(cat.href + "/")
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                  cat.highlight && "text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
                )}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
                {cat.badge && (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                    {cat.badge}
                  </span>
                )}
                {(pathname === cat.href || pathname.startsWith(cat.href + "/")) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 -z-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800"
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
          <span className="font-serif text-[clamp(1.1rem,4vw,1.5rem)] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            THRIFTX
          </span>
          <span className="block text-[clamp(7px,1.5vw,8px)] font-bold uppercase tracking-[0.25em] text-neutral-400 leading-none mt-[-2px]">
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
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <Search size={22} />
            </motion.button>
          </Tooltip>

          <Tooltip label={totalItems > 0 ? `${totalItems} in cart` : "Cart"}>
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
                  className="flex h-11 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 px-5 text-sm font-bold text-white transition-all hover:from-neutral-800 hover:to-neutral-700 hover:shadow-lg hover:scale-105 dark:from-neutral-100 dark:to-neutral-200 dark:text-neutral-900 dark:hover:from-white dark:hover:to-neutral-300"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              </Tooltip>
            )}
          </div>
        </div>
      </header>

      <div className="h-20" />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} logout={logout} />
    </>
  );
}

