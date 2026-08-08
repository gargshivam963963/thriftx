"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Check,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

// ── Business info ────────────────────────────────────────────────────────────
const BUSINESS_EMAIL = "support@thriftx.in";
const WHATSAPP_NUMBER = "919876543210";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Careers", href: "/careers" },
];

const shopLinks = [
  { label: "Men", href: "/shop/men" },
  { label: "Women", href: "/shop/women" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Best Sellers", href: "/shop?sort=popular" },
  { label: "All Products", href: "/shop" },
];

const supportLinks = [
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Refund Policy", href: "/returns" },
  { label: "Track My Order", href: "/profile/orders" },
  { label: "Help Center", href: "/faqs" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/thriftxpanipat/",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100009105021343",
    icon: Facebook,
  },
  { label: "Email", href: `mailto:${BUSINESS_EMAIL}`, icon: Mail },
  { label: "WhatsApp", href: WHATSAPP_LINK, icon: MessageCircle },
];

const trustBadges = [
  { icon: Truck, label: "Fast Shipping" },
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Lock, label: "Secure Checkout" },
];

const paymentMethods = ["VISA", "MC", "UPI", "PayPal", "RuPay"];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Hide footer on admin routes
  if (pathname?.startsWith("/admin")) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setStatus("error");
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus("error");
      toast.error("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    // Simulate a subscribe request.
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      toast.success("You're subscribed! Check your inbox for a welcome note.");
      setTimeout(() => setStatus("idle"), 4000);
    }, 900);
  };

  const inputIdle =
    "border-border bg-muted focus:border-muted-foreground focus:ring-border";
  const inputSuccess =
    "border-success bg-success-bg/40 focus:border-success focus:ring-success/20";
  const inputError =
    "border-error bg-error-bg/40 focus:border-error focus:ring-error/20";

  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-card">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <Container className="py-14 lg:py-20">
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
          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-body-lg font-bold text-background shadow-popover transition-all group-hover:scale-105 dark:bg-muted dark:text-foreground">
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
              affordability. Every piece is quality checked before it reaches your
              wardrobe.
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="text-caption text-foreground">Get First Dibs</h4>
              <p className="mt-1.5 text-body-sm text-muted-foreground">
                Be the first to know about new drops and exclusive deals.
              </p>
              <form onSubmit={handleSubscribe} className="mt-4 flex max-w-sm flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== "idle") setStatus("idle");
                    }}
                    placeholder="Your email address"
                    aria-label="Email address"
                    aria-invalid={status === "error"}
                    leftIcon={<Mail className="h-4 w-4" />}
                    variant="lg"
                    error={status === "error"}
                    className={cn(
                      "h-12",
                      status === "success" &&
                      "border-success bg-success-bg/40 focus:border-success focus:ring-success/20",
                    )}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="
    h-12
    min-w-[170px]
    w-full
    sm:w-auto
    gap-2
    justify-center
    items-center
    font-medium

    text-primary-foreground
    dark:text-primary-foreground

    [&>svg]:h-4
    [&>svg]:w-4
    [&>svg]:shrink-0
    [&>svg]:text-current
  "
                  // loading={loading}
                  loadingText="Subscribing..."
                  success={status === "success"}
                  successText="Subscribed"
                >
                  <Send />

                  <span className="whitespace-nowrap">
                    Subscribe
                  </span>
                </Button>
              </form>
              {status === "success" && (
                <p className="mt-2.5 flex items-center gap-1.5 text-small font-medium text-success-foreground">
                  <Check size={13} /> You&apos;re in! Watch your inbox.
                </p>
              )}
              {status === "error" && (
                <p className="mt-2.5 text-small font-medium text-error">
                  Please enter a valid email.
                </p>
              )}
              <p className="mt-2.5 text-small text-muted-foreground">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-caption text-foreground">Company</h4>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href + link.label}>
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

            <h4 className="mt-8 text-caption text-foreground">Legal</h4>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href + link.label}>
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

          {/* Shop + Support */}
          <div className="lg:col-span-3">
            <h4 className="text-caption text-foreground">Shop</h4>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href + link.label}>
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

            <h4 className="mt-8 text-caption text-foreground">Support</h4>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href + link.label}>
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

          {/* Contact + Social + Hours */}
          <div className="col-span-2 md:col-span-1 lg:col-span-3">
            <h4 className="text-caption text-foreground">Customer Support</h4>
            <div className="mt-5 space-y-3">
              <a
                href={`mailto:${BUSINESS_EMAIL}`}
                className="flex items-center gap-2.5 text-body-sm text-muted-foreground transition hover:text-foreground"
              >
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                {BUSINESS_EMAIL}
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-body-sm text-muted-foreground transition hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                WhatsApp Support
              </a>
              <div className="flex items-center gap-2.5 text-body-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                Panipat, Haryana, India
              </div>
              <div className="flex items-start gap-2.5 text-body-sm text-muted-foreground">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  WhatsApp Support Only
                  <br />
                  Mon&ndash;Sat, 10 AM &ndash; 7 PM IST
                </span>
              </div>
            </div>

            <h4 className="mt-8 text-caption text-foreground">Follow Us</h4>
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

        {/* ── Bottom bar ───────────────────────────────────────── */}
        <div className="mt-14 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <p className="text-center text-body-sm text-muted-foreground lg:text-left">
              © {new Date().getFullYear()} THRIFTX. Sustainable luxury, redefined.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
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
      </Container>
    </footer>
  );
}
