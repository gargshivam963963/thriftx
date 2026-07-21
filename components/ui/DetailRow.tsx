interface DetailRowProps {
    label: string;
    value: string;
}

export default function DetailRow({
    label,
    value,
}: DetailRowProps) {
    return (
        <div className="flex items-center justify-between border-b border-neutral-100 py-[10px] last:border-none">
            <span className="text-[13px] font-medium text-neutral-500">
                {label}
            </span>

            <span className="text-[15px] font-semibold text-neutral-900">
                {value}
            </span>
        </div>
    );
}