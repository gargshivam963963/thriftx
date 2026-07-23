"use client";

import {
    CheckCircle2,
    Leaf,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
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
        <section className="bg-white py-24">

            <Container>

                <div className="grid items-center gap-16 lg:grid-cols-2">

                    <FadeUp>

                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                            About THRIFTX
                        </span>

                        <h2 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
                            Premium thrift shopping,
                            <br />
                            without compromise.
                        </h2>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
                            THRIFTX combines premium fashion,
                            sustainability and trust to create an
                            online thrift experience that feels as
                            polished as buying from a luxury brand.
                        </p>

                        <div className="mt-10 grid grid-cols-2 gap-4">

                            {benefits.map((item) => (

                                <div
                                    key={item}
                                    className="flex items-center gap-3"
                                >

                                    <CheckCircle2 className="h-5 w-5 text-green-600" />

                                    <span className="text-neutral-700">
                                        {item}
                                    </span>

                                </div>

                            ))}

                        </div>

                        <Button
                            className="mt-10"
                            size="lg"
                        >
                            Learn More
                        </Button>

                    </FadeUp>

                    <StaggerContainer className="space-y-6">

                        {features.map(({ icon: Icon, title, description }) => (

                            <StaggerItem key={title}>

                                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">

                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white">

                                        <Icon className="h-8 w-8" />

                                    </div>

                                    <h3 className="text-2xl font-semibold text-neutral-900">
                                        {title}
                                    </h3>

                                    <p className="mt-4 leading-7 text-neutral-600">
                                        {description}
                                    </p>

                                </div>

                            </StaggerItem>

                        ))}

                    </StaggerContainer>

                </div>

            </Container>

        </section>
    );
}