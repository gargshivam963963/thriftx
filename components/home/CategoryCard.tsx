"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import PremiumImage from "@/components/ui/PremiumImage";
import {
    lift,
    motionTokens,
    staggerDelay,
} from "@/components/animations/Motion";

interface CategoryCardProps {
    title: string;
    image: string;
    href: string;
    productCount: number;
    badge?: string;
}

export default function CategoryCard({
    title,
    image,
    href,
    productCount,
    badge,
}: CategoryCardProps) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 40,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
                amount: 0.2,
            }}
            whileHover={lift.card}
            transition={{
                duration: motionTokens.duration.slow,
                ease: motionTokens.ease.standard,
                delay: 0,
            }}
            className="h-full"
        >
            <Link
                href={href}
                className="
          group
          block
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          shadow-card
          transition-all
          duration-500
          hover:border-foreground/30
          hover:shadow-float
        "
            >
                {/* IMAGE */}

                <div className="relative aspect-[4/5] overflow-hidden">
                    <PremiumImage
                        src={image}
                        alt={title}
                        fill
                        rounded
                        sizes="(max-width:768px)100vw,(max-width:1200px)50vw,25vw"
                        className="
              object-cover
              transition-all
              duration-1000
              ease-out
              group-hover:scale-[1.08]
            "
                    />

                    {/* Gradient */}

                    <div
                        className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/70
              via-black/10
              to-transparent
              transition-all
              duration-500
              group-hover:from-black/80
            "
                    />

                    {/* Badge */}

                    {badge && (
                        <div className="absolute left-4 top-4">
                            <span
                                className="
                  rounded-full
                  bg-white/90
                  px-3
                  py-1.5
                  text-small
                  font-semibold
                  uppercase
                  tracking-widest
                  backdrop-blur-xl
                "
                            >
                                {badge}
                            </span>
                        </div>
                    )}

                    {/* Bottom */}

                    <div
                        className="
              absolute
              inset-x-0
              bottom-0
              p-6
              text-white
            "
                    >
                        <p
                            className="
                text-caption
                uppercase
                tracking-widest
                text-white/80
              "
                        >
                            {productCount}+ Products
                        </p>

                        <h3
                            className="
                mt-2
                text-heading-3
                font-semibold
                tracking-tight
              "
                        >
                            {title}
                        </h3>

                        <div
                            className="
                mt-6
                flex
                items-center
                justify-between
              "
                        >
                            <span
                                className="
                  text-body
                  font-medium
                  text-white/90
                "
                            >
                                Shop Collection
                            </span>

                            <div
                                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-black
                  transition-all
                  duration-300
                  group-hover:rotate-45
                "
                            >
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}