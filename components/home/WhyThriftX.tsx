"use client";

import { CheckCircle2, Leaf, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import {
    FadeUp,
    StaggerContainer,
    StaggerItem,
} from "@/components/animations";

const features = [
    {
        icon: ShieldCheck,
        title: "Quality Checked",
        description:
            "Every product goes through careful quality inspection before it reaches you.",
    },
    {
        icon: Sparkles,
        title: "Premium Selection",
        description:
            "Only the best branded and fashionable pieces make it into our collection.",
    },
    {
        icon: Leaf,
        title: "Sustainable Fashion",
        description:
            "Reduce waste while enjoying premium fashion at affordable prices.",
    },
];

const benefits = [
    "Real product photos",
    "Branded fashion",
    "Fast shipping",
    "Secure checkout",
    "Limited unique pieces",
    "Trusted customer support",
];

export default function WhyThriftX() {
    return (
        <section className="bg-neutral-50 py-24 dark:bg-neutral-950">
            <Container>
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* ── Left: Content ─────────────────────────────── */}
                    <FadeUp>
                        <div className="space-y-6">
                            <Badge variant="secondary" size="md" rounded="full" className="mb-2">
                                About THRIFTX
                            </Badge>
                            <h2 className="text-h2 font-bold text-neutral-900 dark:text-neutral-100">
                                Premium thrift shopping,
                                <br />
                                without compromise.
                            </h2>
                            <p className="max-w-xl text-body leading-relaxed text-neutral-600 dark:text-neutral-400">
                                THRIFTX combines premium fashion, sustainability and trust to
                                create an online thrift experience that feels as polished as buying
                                from a luxury brand.
                            </p>

                            {/* Benefits Checklist */}
                            <div className="grid grid-cols-2 gap-3">
                                {benefits.map((item) => (
                                    <div key={item} className="flex items-center gap-2.5">
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button size="lg">
                                Learn More
                            </Button>
                        </div>
                    </FadeUp>

                    {/* ── Right: Feature Cards ──────────────────────── */}
                    <StaggerContainer className="space-y-6">
                        {features.map(({ icon: Icon, title, description }) => (
                            <StaggerItem key={title}>
                                <Card className="border-neutral-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700">
                                    <CardContent className="p-6 md:p-8">
                                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                            {title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                            {description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </Container>
        </section>
    );
}

