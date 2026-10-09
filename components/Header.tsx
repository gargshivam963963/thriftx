"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  LayoutDashboard,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
// GlobalSearch is heavy and only visible when the user opens the search, so we
// code-split it out of the initial header bundle.
const GlobalSearch = dynamic(
  () => import("@/components/search/GlobalSearch"),
  { ssr: false, loading: () => null },
);
import AnnouncementBar from "@/components/marketing/AnnouncementBar";
import NotificationBell from "@/components/marketing/NotificationBell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavCategory {
  label: string;
  href: string;
  icon: string;
  highlight?: boolean;
}

// Primary navigation is intentionally short: only real destinations a shopper
// looks for. Everything else lives inside /shop as a filter/sort, not as its own
// top-level link.
//
// NOTE: there is deliberately no "New Arrivals" item — `/shop` already sorts by
// `createdAt desc`, so `/shop` and `/shop?sort=newest` are the *same page*.
// Shipping both made the nav look padded and gave shoppers two doors into one
// room. If you want "New In" as a word, change the label below instead of
// adding a second link.
const navCategories: NavCategory[] = [
  {
    label: "Shop",
    href: "/shop",
    icon: "✳️",
  },
  {
    label: "Sale",
    href: "/shop?sort=sale",
    icon: "🏷️",
    highlight: true,
  },
  {
    label: "Blog",
    href: "/blog",
    icon: "✎",
  },
];

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

function CartBadge({
  count,
}: {
  count: number;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
      }}
      className="
        absolute
        -right-0.5
        -top-0.5
        flex
        h-[18px]
        min-w-[18px]
        items-center
        justify-center
        rounded-full
        bg-foreground
        px-1
        text-badge
        font-bold
        leading-none
        text-background
        dark:bg-muted
        dark:text-foreground
      "
    >
      {count > 9 ? "9+" : count}
    </motion.span>
  );
}

function UserAvatar({
  name,
  email,
  size = "sm",
}: {
  name?: string;
  email?: string;
  size?: "sm" | "md";
}) {
  const initial = (
    name ||
    email ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

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

function UserDropdown({
  user,
  logout,
}: {
  user: {
    $id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  logout: () => void;
}) {
  const [open, setOpen] =
    useState(false);

  const ref =
    useRef<HTMLDivElement>(null);

  const isAdmin =
    user.role === "admin";

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        ref.current &&
        !ref.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const menuItems = [
    ...(isAdmin
      ? [
        {
          href: "/admin/dashboard",
          label: "Admin Panel",
          icon: LayoutDashboard,
        },
      ]
      : []),
    {
      href: "/profile",
      label: "Profile",
      icon: UserCircle,
    },
    {
      href: "/profile/orders",
      label: "Orders",
      icon: Package,
    },
    {
      href: "/profile/wishlist",
      label: "Wishlist",
      icon: Heart,
    },
    {
      href: "/profile/addresses",
      label: "Addresses",
      icon: MapPin,
    },
    {
      href: "/profile/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div
      ref={ref}
      className="relative"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="
          relative
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          transition
          hover:bg-muted
          dark:hover:bg-card
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        <UserAvatar
          name={user.name}
          email={user.email}
          size="sm"
        />

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
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -6,
              scale: 0.96,
            }}
            transition={{
              duration: 0.15,
            }}
            className="
              absolute
              right-0
              top-full
              z-50
              mt-2
              w-60
              origin-top-right
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card
              shadow-float
            "
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
              {menuItems.map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() =>
                      setOpen(false)
                    }
                    className="
                      flex
                      min-h-10
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-body-sm
                      font-medium
                      text-foreground
                      transition
                      hover:bg-muted
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-ring
                    "
                  >
                    <item.icon
                      size={17}
                      className="text-muted-foreground"
                    />

                    {item.label}
                  </Link>
                ),
              )}

              <div className="my-1.5 h-px bg-border" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                role="menuitem"
                className="
                  flex
                  min-h-10
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  text-error
                  transition
                  hover:bg-error-bg/50
                  hover:text-error
                "
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

function MobileMenu({
  open,
  onClose,
  user,
  logout,
}: {
  open: boolean;
  onClose: () => void;
  user: {
    $id: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  logout: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-[90]
              bg-black/50
              backdrop-blur-md
            "
            onClick={onClose}
          />

          <motion.div
            initial={{
              x: "-100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "-100%",
            }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 300,
            }}
            className="
              fixed
              inset-y-0
              left-0
              z-[100]
              w-[86vw]
              max-w-sm
              overflow-y-auto
              bg-background
              shadow-2xl
              dark:bg-card
            "
          >
            <div
              className="
                flex
                min-h-16
                items-center
                justify-between
                border-b
                border-border
                px-5
                sm:px-6
              "
            >
              <Link
                href="/"
                onClick={onClose}
                className="
                  font-display
                  text-title
                  font-bold
                  tracking-tighter
                  text-foreground
                "
              >
                THRIFTX
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                onClick={onClose}
                aria-label="Close menu"
                className="
                  min-h-11
                  min-w-11
                  rounded-xl
                  p-2.5
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                "
              >
                <X size={22} />
              </Button>
            </div>

            {user && (
              <div className="border-b border-border px-5 py-5 sm:px-6">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    name={user.name}
                    email={user.email}
                    size="md"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-body font-bold text-foreground">
                      {user.name || "User"}
                    </p>

                    <p className="truncate text-small text-muted-foreground">
                      {user.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="px-3 py-6 sm:px-4">
              <p className="px-3 pb-3 text-caption text-muted-foreground">
                Browse
              </p>

              <div className="space-y-1">
                {navCategories.map(
                  (cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={onClose}
                      className={cn(
                        "flex min-h-12 items-center gap-4 rounded-2xl px-4 py-3.5 text-body-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        cat.highlight
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span
                        className="text-xl"
                        aria-hidden="true"
                      >
                        {cat.icon}
                      </span>

                      <span>
                        {cat.label}
                      </span>

                    </Link>
                  ),
                )}
              </div>

              <div className="mt-8">
                <p className="px-3 pb-3 text-caption text-muted-foreground">
                  Account
                </p>

                <div className="space-y-1">
                  {user ? (
                    <>
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          onClick={onClose}
                          className="
                            flex
                            min-h-12
                            items-center
                            gap-4
                            rounded-2xl
                            px-4
                            py-3.5
                            text-body-sm
                            font-semibold
                            text-muted-foreground
                            transition
                            hover:bg-muted
                            hover:text-foreground
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ring
                          "
                        >
                          <LayoutDashboard size={22} />
                          Admin Panel
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        onClick={onClose}
                        className="
                          flex
                          min-h-12
                          items-center
                          gap-4
                          rounded-2xl
                          px-4
                          py-3.5
                          text-body-sm
                          font-semibold
                          text-muted-foreground
                          transition
                          hover:bg-muted
                          hover:text-foreground
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                      >
                        <UserCircle
                          size={22}
                        />
                        My Profile
                      </Link>

                      <Link
                        href="/profile/orders"
                        onClick={onClose}
                        className="
                          flex
                          min-h-12
                          items-center
                          gap-4
                          rounded-2xl
                          px-4
                          py-3.5
                          text-body-sm
                          font-semibold
                          text-muted-foreground
                          transition
                          hover:bg-muted
                          hover:text-foreground
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                      >
                        <Package
                          size={22}
                        />
                        Orders
                      </Link>

                      <Link
                        href="/profile/wishlist"
                        onClick={onClose}
                        className="
                          flex
                          min-h-12
                          items-center
                          gap-4
                          rounded-2xl
                          px-4
                          py-3.5
                          text-body-sm
                          font-semibold
                          text-muted-foreground
                          transition
                          hover:bg-muted
                          hover:text-foreground
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                      >
                        <Heart size={22} />
                        Wishlist
                      </Link>

                      <Link
                        href="/profile/addresses"
                        onClick={onClose}
                        className="
                          flex
                          min-h-12
                          items-center
                          gap-4
                          rounded-2xl
                          px-4
                          py-3.5
                          text-body-sm
                          font-semibold
                          text-muted-foreground
                          transition
                          hover:bg-muted
                          hover:text-foreground
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                      >
                        <MapPin size={22} />
                        Addresses
                      </Link>

                      <Link
                        href="/profile/settings"
                        onClick={onClose}
                        className="
                          flex
                          min-h-12
                          items-center
                          gap-4
                          rounded-2xl
                          px-4
                          py-3.5
                          text-body-sm
                          font-semibold
                          text-muted-foreground
                          transition
                          hover:bg-muted
                          hover:text-foreground
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                      >
                        <Settings size={22} />
                        Settings
                      </Link>

                      <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          logout();
                          onClose();
                        }}
                        className="
                          flex
                          w-full
                          items-center
                          justify-start
                          gap-4
                          min-h-12
                          rounded-2xl
                          px-4
                          text-error
                          transition
                          hover:bg-error-bg/50
                        "
                      >
                        <LogOut size={22} />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        onClick={onClose}
                      >
                        <Button
                          size="lg"
                          fullWidth
                          className="min-h-12"
                        >
                          <User size={18} />
                          Sign In
                        </Button>
                      </Link>

                      <Link
                        href="/signup"
                        onClick={onClose}
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          fullWidth
                          className="min-h-12"
                        >
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            <div className="border-t border-border px-5 py-5 sm:px-6">
              <div className="space-y-2">
                <span className="text-body-sm font-medium text-muted-foreground">
                  Appearance
                </span>

                <ThemeToggle variant="segmented" size="md" className="w-full" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HeaderSkeleton() {
  return (
    <header
      className="
        sticky
        top-0
        z-header
        w-full
        border-b
        border-border
        bg-background/90
        backdrop-blur-xl
      "
    >
      <Container
        className="
          flex
          h-header
          items-center
          justify-between
          gap-4
          !px-4
          sm:!px-6
          lg:!px-8
          xl:!px-10
        "
      >
        <div className="h-11 w-11 animate-pulse rounded-xl bg-muted lg:hidden" />

        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted sm:w-40" />

        <div className="hidden items-center gap-2 lg:flex">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-10 w-16 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden h-11 w-11 animate-pulse rounded-xl bg-muted md:block" />
          <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
          <div className="hidden h-10 w-10 animate-pulse rounded-full bg-muted md:block" />
        </div>
      </Container>
    </header>
  );
}

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
      whileTap={{
        scale: 0.9,
      }}
      aria-label={label}
      onClick={onClick}
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-2xl
        text-foreground
        transition-colors
        hover:bg-muted
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
        dark:hover:bg-card
      "
    >
      {icon}
    </motion.button>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  );
}

function HeaderContent() {
  const router = useRouter();
  const pathname =
    usePathname();
  const searchParams = useSearchParams();

  const {
    user,
    logout,
    loading,
  } = useAuth();

  const {
    totalItems,
  } = useCart();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (
    pathname?.startsWith(
      "/admin",
    )
  ) {
    return null;
  }

  if (loading) {
    return <HeaderSkeleton />;
  }

  const iconSize = 20;
  const iconStroke = 2;

  return (
    <>
      <AnnouncementBar />

      <header
        className="
          sticky
          top-0
          z-header
          w-full
          border-b
          border-white/40
          bg-white/55
          shadow-[0_8px_32px_rgba(0,0,0,0.06)]
          backdrop-blur-2xl
          backdrop-saturate-150
          transition-all
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]
          dark:border-white/10
          dark:bg-zinc-950/55
        "
      >
        {/*
         * IMPORTANT:
         * Header inner container uses the exact same
         * 1440px width and horizontal padding scale
         * as the shop content.
         */}
        <Container
          className="
            flex
            h-header
            items-center
            justify-between
            gap-3
            !px-4
            sm:!px-6
            lg:!px-8
            xl:!px-10
          "
        >
          {/* MOBILE MENU */}
          <div className="flex items-center gap-1 lg:hidden">
            <IconButton
              label="Open menu"
              icon={
                <Menu
                  size={iconSize}
                  strokeWidth={
                    iconStroke
                  }
                />
              }
              onClick={() =>
                setMobileMenuOpen(
                  true,
                )
              }
            />
          </div>

          {/* LOGO */}
          <Link
            href="/"
            className="
              group
              flex
              shrink-0
              items-center
              gap-2.5
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-foreground
                text-body
                font-bold
                text-background
                shadow-popover
                transition-transform
                group-hover:scale-105
                dark:bg-muted
                dark:text-foreground
                sm:h-10
                sm:w-10
              "
            >
              T
            </div>

            <div className="min-w-0">
              <span
                className="
                  block
                  font-display
                  text-body
                  font-extrabold
                  leading-none
                  tracking-wider
                  text-foreground
                  sm:text-title
                "
              >
                THRIFTX
              </span>

              <span
                className="
                  mt-1
                  hidden
                  text-badge
                  font-semibold
                  uppercase
                  leading-tight
                  tracking-caps
                  text-muted-foreground
                  sm:block
                "
              >
                Premium Thrift
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav
            aria-label="Main navigation"
            className="
              hidden
              items-center
              gap-0.5
              lg:flex
            "
          >
            {navCategories.map(
              (cat) => {
                const basePath =
                  cat.href.split(
                    "?",
                  )[0];
                const query =
                  cat.href.split("?")[1];

                const active = query
                  ? pathname === basePath &&
                  Array.from(
                    new URLSearchParams(query).entries(),
                  ).every(([key, value]) => searchParams.get(key) === value)
                  : (pathname === basePath &&
                    !searchParams.has("sort")) ||
                  pathname.startsWith(`${basePath}/`);

                return (
                  <Link
                    key={
                      cat.href
                    }
                    href={
                      cat.href
                    }
                    className={cn(
                      `
                        relative
                        inline-flex
                        min-h-10
                        items-center
                        whitespace-nowrap
                        rounded-xl
                        px-3.5
                        py-2
                        text-label
                        font-semibold
                        transition-colors
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-ring
                      `,
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      cat.highlight &&
                      "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300",
                    )}
                  >
                    {cat.label}

                    {active && (
                      <motion.div
                        layoutId="navIndicator"
                        className="
                          absolute
                          inset-0
                          -z-10
                          rounded-xl
                          bg-muted
                          dark:bg-card
                        "
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              },
            )}
          </nav>

          {/* RIGHT ACTIONS */}
          <div
            className="
              flex
              shrink-0
              items-center
              gap-0.5
              sm:gap-1
            "
          >
            <div className="hidden md:block">
              <ThemeToggle size="md" />
            </div>

            <Tooltip label="Search products">
              <IconButton
                label="Search products"
                icon={
                  <Search
                    size={
                      iconSize
                    }
                    strokeWidth={
                      iconStroke
                    }
                  />
                }
                onClick={() =>
                  setSearchOpen(
                    true,
                  )
                }
              />
            </Tooltip>

            <NotificationBell />

            <Tooltip
              label={
                totalItems > 0
                  ? `${totalItems} in carts`
                  : "Cart"
              }
            >
              <Link
                href="/cart"
                aria-label="Shopping cart"
                className="
                  relative
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  text-muted-foreground
                  transition-colors
                  hover:bg-muted
                  hover:text-foreground
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring
                  dark:hover:bg-card
                "
              >
                <ShoppingBag
                  size={iconSize}
                  strokeWidth={
                    iconStroke
                  }
                />

                <CartBadge
                  count={
                    totalItems
                  }
                />
              </Link>
            </Tooltip>

            <div className="ml-1 hidden items-center md:flex">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Tooltip label="Admin Panel">
                      <Link
                        href="/admin/dashboard"
                        aria-label="Admin Panel"
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          text-muted-foreground
                          transition-colors
                          hover:bg-muted
                          hover:text-foreground
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-ring
                          dark:hover:bg-card
                        "
                      >
                        <LayoutDashboard
                          size={iconSize}
                          strokeWidth={iconStroke}
                        />
                      </Link>
                    </Tooltip>
                  )}

                  <UserDropdown
                    user={user}
                    logout={logout}
                  />
                </>
              ) : (
                <Tooltip label="Sign in">
                  <Button
                    onClick={() =>
                      router.push(
                        "/login",
                      )
                    }
                    variant="primary"
                    size="md"
                    className="min-h-11 rounded-xl px-4"
                  >
                    <User
                      size={
                        iconSize
                      }
                      strokeWidth={
                        iconStroke
                      }
                    />
                    Sign In
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </Container>
      </header>

      <GlobalSearch
        open={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
      />

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
        user={user}
        logout={logout}
      />
    </>
  );
}