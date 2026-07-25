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
  icon?: string;
  highlight?: boolean;
}

// ─── Categories ───────────────────────────────────────────────────────────────

const navCategories: NavCategory[] = [
  { label: "Men", href: "/shop/men", icon: "👔" },
  { label: "Women", href: "/shop/women", icon: "👗" },
  { label: "Vintage", href: "/shop/vintage", icon: "✨", highlight: true },
  { label: "New In", href: "/shop?sort=newest", icon: "🔥" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="absolute -right-2 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 px-1.5 text-[10px] font-bold leading-none text-white shadow-lg dark:from-white dark:to-zinc-300 dark:text-black"
    >
      {count > 9 ? "9+" : count}
    </motion.span>
  );
}

function UserAvatar({ name, email, size = "md" }: { name?: string; email?: string; size?: "sm" | "md" | "lg" }) {
  const initial = (name || email || "U").charAt(0).toUpperCase();
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-lg" };

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 font-bold text-white shadow-lg ring-2 ring-white/20 dark:from-zinc-200 dark:via-zinc-300 dark:to-zinc-100 dark:text-black dark:ring-black/10",
      sizes[size]
    )}>
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
        className="flex items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
      >
        <UserAvatar name={user.name} email={user.email} size="sm" />
        <div className="hidden text-left lg:block">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {user.name || "User"}
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
            {user.email || ""}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-zinc-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl shadow-black/5 dark:border-zinc-700/50 dark:bg-zinc-900"
          >
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {user.name || "User"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {user.email || ""}
              </p>
            </div>
            <div className="p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <item.icon size={18} className="text-zinc-400 dark:text-zinc-500" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-zinc-100 p-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => { setOpen(false); logout(); }}
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

function MobileMenu({ open, onClose, user, logout }: {
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
            className="fixed inset-y-0 left-0 z-[100] w-[85vw] max-w-sm overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <Link href="/" onClick={onClose} className="font-serif text-2xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">
                THRIFTX
              </Link>
              <button type="button" onClick={onClose} className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                <X size={22} />
              </button>
            </div>

            {user && (
              <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <UserAvatar name={user.name} email={user.email} size="md" />
                  <div>
                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{user.name || "User"}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email || ""}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="px-4 py-6">
              <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Categories</p>
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
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    {cat.label}
                    {cat.highlight && (
                      <span className="ml-auto rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Hot
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-8">
                <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Account</p>
                <div className="space-y-1">
                  {user ? (
                    <>
                      <Link href="/profile" onClick={onClose} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                        <UserCircle size={22} /> My Profile
                      </Link>
                      <Link href="/profile/orders" onClick={onClose} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                        <Package size={22} /> Orders
                      </Link>
                      <Link href="/profile/wishlist" onClick={onClose} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                        <Heart size={22} /> Wishlist
                      </Link>
                      <button type="button" onClick={() => { logout(); onClose(); }} className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30">
                        <LogOut size={22} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={onClose} className="flex items-center gap-4 rounded-2xl bg-zinc-900 px-4 py-3.5 text-base font-semibold text-white transition hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900">
                        <User size={22} /> Sign In
                      </Link>
                      <Link href="/signup" onClick={onClose} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>

            <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Appearance</span>
                <ThemeToggle size="md" />
              </div>
            </div>

            <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <p className="text-xs text-zinc-400">Premium Thrift Fashion &mdash; THRIFTX</p>
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
    <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-zinc-100 bg-white/80 px-5 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6 md:px-10 xl:px-16">
      <div className="flex items-center gap-4">
        <div className="h-6 w-6 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700 md:hidden" />
        <div className="hidden gap-8 md:flex">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          ))}
        </div>
      </div>
      <div className="h-9 w-36 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-6 w-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
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

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // Hide header on admin routes — admin has its own sidebar/layout
  if (pathname?.startsWith("/admin")) return null;

  if (loading) return <HeaderSkeleton />;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 flex h-20 w-full items-center justify-between",
          "border-b border-zinc-100/80 bg-white/90 px-5 backdrop-blur-2xl",
          "dark:border-zinc-800/50 dark:bg-zinc-900/90",
          "sm:px-6 md:px-10 xl:px-16",
          "shadow-sm",
          "transition-all duration-300",
        )}
      >
        {/* ── Left Section ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </motion.button>

          {/* Desktop Logo (left-aligned on md+) */}
          <Link
            href="/"
            className="hidden md:flex items-center gap-3 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 text-base font-bold text-white shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl dark:from-white dark:via-zinc-200 dark:to-zinc-300 dark:text-black">
              T
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                THRIFTX
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400 leading-none">
                Premium Thrift
              </span>
            </div>
          </Link>

          {/* Desktop Category Nav */}
          <nav className="hidden items-center gap-1 ml-6 lg:flex">
            {navCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "group relative rounded-2xl px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-all",
                  pathname === cat.href || pathname.startsWith(cat.href + "/")
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                  cat.highlight && "text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
                )}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
                {cat.highlight && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse-soft" />
                )}
                {(pathname === cat.href || pathname.startsWith(cat.href + "/")) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 -z-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Center: Mobile Logo ────────────────────────────────── */}
        <Link
          href="/"
          className="flex flex-col items-center md:hidden"
        >
          <span className="font-serif text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            THRIFTX
          </span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400 leading-none mt-[-2px]">
            Premium Thrift
          </span>
        </Link>

        {/* ── Right: Actions ────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Theme Toggle (Desktop) */}
          <div className="hidden md:block">
            <ThemeToggle size="md" />
          </div>

          {/* Search */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Search size={22} />
          </motion.button>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <ShoppingBag size={22} />
            <CartBadge count={totalItems} />
          </Link>

          {/* User (Desktop) */}
          <div className="hidden items-center md:flex">
            {user ? (
              <UserDropdown user={user} logout={logout} />
            ) : (
              <Link
                href="/login"
                aria-label="Account"
                className="flex h-11 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 text-sm font-bold text-white transition-all hover:from-zinc-800 hover:to-zinc-700 hover:shadow-lg hover:scale-105 dark:from-zinc-100 dark:to-zinc-200 dark:text-zinc-900 dark:hover:from-white dark:hover:to-zinc-300"
              >
                <User size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* ── Global Search ─────────────────────────────────────────── */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Mobile Menu ──────────────────────────────────────────── */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        logout={logout}
      />
    </>
  );
}

