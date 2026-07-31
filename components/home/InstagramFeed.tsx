"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import {
    FadeUp,
    StaggerContainer,
    StaggerItem,
} from "@/components/animations";

const posts = [
    "/images/instagram/1.webp",
    "/images/instagram/2.webp",
    "/images/instagram/3.webp",
    "/images/instagram/4.webp",
    "/images/instagram/5.webp",
    "/images/instagram/6.webp",
];

export default function InstagramFeed() {
    return (
        <section className="bg-white py-24 dark:bg-neutral-900">
            <Container>
                <FadeUp>
                    <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                        <div className="space-y-4">
                            <Badge variant="secondary" size="md" rounded="full">
                                Instagram
                            </Badge>
                            <h2 className="text-h2 font-bold text-neutral-900 dark:text-neutral-100">
                                Follow Our Journey
                            </h2>
                            <p className="max-w-xl text-body text-neutral-600 dark:text-neutral-400">
                                Daily drops, styling inspiration and premium thrift finds.
                            </p>
                        </div>
                        <Link href="https://instagram.com/thriftx" target="_blank">
                            <Button variant="outline" size="lg" leftIcon={<Instagram />}>
                                Follow Us
                            </Button>
                        </Link>
                    </div>
                </FadeUp>

                <StaggerContainer className="grid grid-cols-2 gap-5 md:grid-cols-3">
                    {posts.map((image, index) => (
                        <StaggerItem key={index}>
                            <Link
                                href="https://instagram.com/thriftx"
                                target="_blank"
                                className="group block"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-2xl">
                                    <Image
                                        src={image}
                                        alt={`Instagram ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                        className="object-cover transition-all duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                                        <div className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                                            <Instagram className="h-5 w-5 text-neutral-900" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </Container>
        </section>
    );
}

