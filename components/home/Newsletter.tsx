"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/input";
import { FadeUp } from "@/components/animations";

export default function Newsletter() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 py-24 dark:from-black dark:via-neutral-950 dark:to-neutral-900">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]" />
            </div>

            <Container className="relative">
                <FadeUp>
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                            <Mail className="h-8 w-8" />
                        </div>

                        <h2 className="mt-6 text-h2 font-bold text-white">
                            Never Miss A Drop
                        </h2>
                        <p className="mt-4 text-body text-neutral-400">
                            Get notified whenever new premium thrift collections arrive.
                        </p>

                        <form className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="h-12 flex-1 border-white/10 bg-white/10 text-white placeholder:text-neutral-500 focus-visible:border-white/30 focus-visible:ring-white/10"
                            />
                            <Button type="submit" size="lg" rightIcon={<ArrowRight />}>
                                Subscribe
                            </Button>
                        </form>

                        <p className="mt-4 text-sm text-neutral-500">
                            No spam. Unsubscribe anytime.
                        </p>

                        <div className="mt-8">
                            <Link href="/shop">
                                <Button variant="ghost" className="text-neutral-400 hover:text-white">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </FadeUp>
            </Container>
        </section>
    );
}

