"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeUp } from "@/components/animations";

export default function Newsletter() {
    return (
        <section className="relative overflow-hidden bg-neutral-900 py-24">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_60%)]" />

            <Container className="relative">

                <FadeUp>

                    <GlassCard className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-white/10 p-10 backdrop-blur-2xl md:p-16">

                        <div className="mx-auto max-w-3xl text-center">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-neutral-900">

                                <Mail className="h-10 w-10" />

                            </div>

                            <h2 className="mt-8 text-4xl font-bold text-white md:text-5xl">
                                Never Miss A Drop
                            </h2>

                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
                                Get notified whenever new premium thrift
                                collections arrive.
                            </p>

                            <form className="mt-10 flex flex-col gap-4 md:flex-row">

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-14 flex-1 rounded-2xl border border-white/10 bg-white/10 px-6 text-white outline-none backdrop-blur-xl placeholder:text-neutral-400"
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                >
                                    Subscribe

                                    <ArrowRight className="ml-2 h-4 w-4" />

                                </Button>

                            </form>

                            <p className="mt-6 text-sm text-neutral-400">
                                No spam. Unsubscribe anytime.
                            </p>

                            <div className="mt-10 flex justify-center">
                                <Link href="/shop">
                                    <Button variant="ghost">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>

                        </div>

                    </GlassCard>

                </FadeUp>

            </Container>

        </section>
    );
}