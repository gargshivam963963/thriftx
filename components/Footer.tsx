"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { contactInfo } from "@/lib/contact";

const WHATSAPP_UPDATES_LINK = `${contactInfo.whatsappUrl}?text=${encodeURIComponent(
  "Hi, I'd like to receive updates about new drops and offers.",
)}`;

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Journal", href: "/blog" },
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
    href: contactInfo.instagramUrl,
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: contactInfo.facebookUrl,
    icon: Facebook,
  },
  { label: "Email", href: `mailto:${contactInfo.email}`, icon: Mail },
  { label: "WhatsApp", href: contactInfo.whatsappUrl, icon: MessageCircle },
];

const trustBadges = [
  { icon: Truck, label: "Fast Shipping" },
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Lock, label: "Secure Checkout" },
];

const paymentMethods = ["VISA", "MC", "UPI", "PayPal", "RuPay"];

function FooterHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2 id={id} className="text-label font-bold uppercase tracking-wider text-foreground">
      {children}
    </h2>
  );
}

function FooterNav({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-labelledby={id} className="min-w-0">
      <FooterHeading id={id}>{title}</FooterHeading>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="group inline-flex max-w-full items-center gap-1.5 text-body text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="h-px w-0 shrink-0 bg-foreground transition-all duration-300 group-hover:w-3" />
              <span className="truncate">{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/30 bg-gradient-to-b from-white/40 to-white/70 dark:border-white/10 dark:from-zinc-950/40 dark:to-zinc-950/70">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      <Container className="py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="glass-liquid glass-card-hover flex min-w-0 items-center gap-3 rounded-2xl p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background dark:bg-muted dark:text-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-body-sm font-semibold text-foreground sm:text-body">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-4 gap-x-4 gap-y-10 border-t border-border pt-12 sm:gap-x-6 md:grid-cols-8 md:gap-y-12 lg:mt-16 lg:grid-cols-12 lg:gap-x-8 lg:pt-16">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-body-lg font-bold text-background shadow-popover transition-transform group-hover:scale-105 dark:bg-muted dark:text-foreground">
                T
              </div>
              <div>
                <span className="font-display text-heading-4 font-bold tracking-tight text-foreground">
                  THRIFTX
                </span>
                <span className="mt-0.5 block text-small font-bold uppercase tracking-widest text-muted-foreground">
                  Premium Branded Thrift Clothing
                </span>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-body leading-relaxed text-muted-foreground">
              Handpicked branded fashion that combines luxury, sustainability,
              and affordability. Every piece is quality checked before it
              reaches your wardrobe.
            </p>

            <div className="mt-8 max-w-md">
              <FooterHeading id="footer-newsletter">
                Get First Dibs
              </FooterHeading>
              <p className="mt-1.5 text-body text-muted-foreground">
                Message us on WhatsApp to hear about new drops and exclusive
                deals.
              </p>
              <Button
                asChild
                variant="primary"
                size="lg"
                className="mt-4 h-12 gap-2 px-5"
              >
                <a
                  href={WHATSAPP_UPDATES_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  Ask for drop updates
                </a>
              </Button>
            </div>
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <FooterNav id="footer-company" title="Company" links={companyLinks} />
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <FooterNav id="footer-shop" title="Shop" links={shopLinks} />
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <FooterNav
              id="footer-support"
              title="Support"
              links={supportLinks}
            />
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <nav aria-labelledby="footer-support-contact" className="min-w-0">
              <FooterHeading id="footer-support-contact">
                Customer Support
              </FooterHeading>
              <div className="mt-5 space-y-3">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-2.5 text-body text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="break-all">{contactInfo.email}</span>
                </a>
                <a
                  href={contactInfo.phoneHref}
                  className="flex items-start gap-2.5 text-body text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  {contactInfo.phone}
                </a>
                <a
                  href={contactInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-body text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  WhatsApp Support
                </a>
                <p className="flex items-start gap-2.5 text-body text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Panipat, Haryana, India
                </p>
                <p className="flex items-start gap-2.5 text-body text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    Mon&ndash;Sat, 10 AM &ndash; 7 PM IST
                  </span>
                </p>
              </div>

              <div className="mt-8">
                <FooterHeading id="footer-social">Follow Us</FooterHeading>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-4 items-center gap-x-4 gap-y-5 border-t border-border pt-8 sm:gap-x-6 md:grid-cols-8 lg:mt-16 lg:grid-cols-12 lg:gap-x-8">
          <p className="col-span-4 text-center text-body-sm text-muted-foreground md:col-span-8 md:text-left lg:col-span-4">
            © {new Date().getFullYear()} THRIFTX. Sustainable luxury, redefined.
          </p>

          <nav
            aria-label="Legal"
            className="col-span-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:col-span-4 lg:col-span-4"
          >
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="col-span-4 flex flex-wrap items-center justify-center gap-2 md:col-span-4 md:justify-end lg:col-span-4">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-bold tracking-wider text-muted-foreground"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
