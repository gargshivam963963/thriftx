import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

interface SectionShellProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

export function SectionShell({
    title,
    description,
    children,
    className,
    contentClassName,
}: SectionShellProps) {
    return (
        <Card className={cn("border-border/70 bg-card/80 backdrop-blur", className)}>
            {(title || description) && (
                <CardContent className="space-y-1 border-b border-border/70 px-6 py-5">
                    {title && <h2 className="text-h4 font-semibold tracking-tight">{title}</h2>}
                    {description && <p className="text-small text-muted-foreground">{description}</p>}
                </CardContent>
            )}
            <CardContent className={cn("px-6 py-6", contentClassName)}>{children}</CardContent>
        </Card>
    );
}
