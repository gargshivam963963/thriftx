'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
} from 'lucide-react';

const shopLinks = [
  { label: "Men", href: "/shop/men" },
  { label: "Women", href: "/shop/women" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Best Sellers", href: "/shop?sort=popular" },
  { label: "All Products", href: "/shop" },
];

const helpLinks = [
  { label: "Sustainability", href: "#" },
  { label: "Shipping & Delivery", href: "#" },
  { label: "Returns & Exchanges", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Terms & Privacy", href: "#" },
];

const accountLinks = [
  { label: "My Account", href: "/profile" },
  { label: "My Orders", href: "/profile/orders" },
  { label: "Wishlist", href: "/profile/wishlist" },
  { label: "Addresses", href: "/profile/addresses" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/thriftx", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com/thriftx", icon: Facebook },
  { label: "Mail", href: "mailto:hello@thriftx.in", icon: Mail },
];

const trustBadges = [
  { icon: Truck, label: "Same-Day Delivery" },
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Lock, label: "Secure Checkout" },
];

const paymentMethods = ["VISA", "MC", "UPI", "PayPal", "RuPay"];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Hide footer on admin routes
  if (pathname?.startsWith('/admin')) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-card">
      {/* Subtle top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        {/* ── Trust Strip ─────────────────────────────────────── */}
        <div className="mb-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-muted/60 px-4 py-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-body font-semibold text-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Main Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-12">
          {/* Brand + Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-foreground via-muted-foreground to-muted-foreground text-body-lg font-bold text-white shadow-popover transition-all group-hover:scale-105 dark:from-white dark:via-muted dark:to-muted-foreground dark:text-black">
                T
              </div>
              <div>
                <span className="font-display text-heading-4 font-bold tracking-tight text-foreground">
                  THRIFTX
                </span>
                <span className="block text-badge font-bold uppercase tracking-widest text-muted-foreground">
                  Premium Branded Thrift Clothing
                </span>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-body-sm leading-relaxed text-muted-foreground">
              Handpicked branded fashion that combines luxury, sustainability, and
              affordability. Every piece is quality checked before it reaches your wardrobe.
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="text-caption text-foreground">
                Get First Dibs
              </h4>
              <p className="mt-1.5 text-body-sm text-muted-foreground">
                Be the first to know about new drops and exclusive deals.
              </p>
              <form onSubmit={handleSubscribe} className="mt-4 flex max-w-sm items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="h-12 w-full rounded-xl border border-border bg-muted pl-10 pr-4 text-body-sm text-foreground outline-none transition focus:border-muted-foreground focus:ring-2 focus:ring-border"
                  />
                </div>
                <button
                  type="submit"
                  className={`flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 text-body-sm font-bold text-white transition-all ${subscribed
                    ? "bg-success"
                    : "bg-foreground text-background hover:bg-muted-foreground"
                    }`}
                >
                  {subscribed ? (
                    <>
                      <Check className="h-4 w-4" /> Done
                    </>
                  ) : (
                    <>
                      Subscribe <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
              <p className="mt-2.5 text-small text-muted-foreground">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2">
            <h4 className="text-caption text-foreground">
              Shop
            </h4>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition hover:text-foreground"
                  >
                    <span className="h-px w-0 bg-foreground transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div className="lg:col-span-2">
            <h4 className="text-caption text-foreground">
              Help
            </h4>
            <ul className="mt-5 space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition hover:text-foreground"
                  >
                    <span className="h-px w-0 bg-foreground transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2.5 text-body-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2.5 text-body-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Panipat, Haryana
              </div>
            </div>
          </div>

          {/* Account + Social */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <h4 className="text-caption text-foreground">
              Account
            </h4>
            <ul className="mt-5 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition hover:text-foreground"
                  >
                    <span className="h-px w-0 bg-foreground transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="mt-8 text-caption text-foreground">
              Follow Us
            </h4>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div className="mt-14 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <p className="text-center text-body-sm text-muted-foreground lg:text-left">
              © {new Date().getFullYear()} THRIFTX. Sustainable luxury, redefined.
            </p>

            <div className="flex items-center gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-border bg-muted px-2.5 py-1 text-badge font-bold tracking-wider text-muted-foreground"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

