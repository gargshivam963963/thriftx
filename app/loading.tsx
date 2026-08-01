import PageSkeleton from "@/components/ui/PageSkeleton";

export default function Loading() {
    return <PageSkeleton header cards={4} cardHeight={220} className="py-10" />;
}
