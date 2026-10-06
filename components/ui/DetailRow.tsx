interface DetailRowProps {
    label: string;
    value: string;
}

export default function DetailRow({
    label,
    value,
}: DetailRowProps) {
    return (
        <div className="flex items-center justify-between border-b border-border py-[10px] last:border-none">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>

            <span className="text-sm font-semibold text-foreground">
                {value}
            </span>
        </div>
    );
}