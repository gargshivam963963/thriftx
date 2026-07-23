"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Instagram } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
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
        <section className="bg-neutral-50 py-24">

            <Container>

                <FadeUp>

                    <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">

                        <div>

                            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                                Instagram
                            </span>

                            <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900">
                                Follow Our Journey
                            </h2>

                            <p className="mt-4 max-w-2xl text-neutral-600">
                                Daily drops, styling inspiration and
                                premium thrift finds.
                            </p>

                        </div>

                        <Button
                            variant="outline"
                        >
                            <Link
                                href="https://instagram.com/thriftx"
                                target="_blank"
                            >
                                <Instagram className="mr-2 h-4 w-4" />
                                Follow Us
                            </Link>
                        </Button>

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

                                <div className="relative aspect-square overflow-hidden rounded-3xl">

                                    <Image
                                        src={image}
                                        alt={`Instagram ${index + 1}`}
                                        fill
                                        className="object-cover transition duration-700 group-hover:scale-110"
                                    />

                                    <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/30" />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">

                                        <div className="rounded-full bg-white p-4">

                                            <ArrowUpRight className="h-5 w-5" />

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