import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement> & {
        separator?: React.ReactNode;
    }
>(({ className, ...props }, ref) => (
    <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex items-center text-sm text-neutral-500", className)}
        {...props}
    />
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
    HTMLOListElement,
    React.OlHTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={cn("flex flex-wrap items-center gap-1.5", className)}
        {...props}
    />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
    HTMLLIElement,
    React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
    />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
    HTMLAnchorElement,
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => (
    <a
        ref={ref}
        className={cn(
            "transition-colors hover:text-neutral-900 dark:hover:text-neutral-100",
            className,
        )}
        {...props}
    />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbSeparator = ({
    children,
    className,
    ...props
}: React.ComponentProps<"li">) => (
    <li
        role="presentation"
        aria-hidden="true"
        className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)}
        {...props}
    >
        {children ?? <ChevronRight size={14} />}
    </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbPage = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn("font-medium text-neutral-900 dark:text-neutral-100", className)}
        {...props}
    />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
};
