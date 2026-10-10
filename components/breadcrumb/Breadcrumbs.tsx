"use client";

import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/metadata";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-body-sm text-muted-foreground"
    >
      {items.map((item, index) => (
        <span key={item.url}>
          {index > 0 && (
            <Link
              href={item.url}
              className="flex items-center gap-1 font-medium text-foreground/70 hover:text-foreground"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          )}
          {index === 0 ? (
            <Link
              href={item.url}
              className="font-medium text-foreground"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-foreground/70">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}
