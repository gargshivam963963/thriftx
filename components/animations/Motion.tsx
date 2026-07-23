"use client";

import {
    motion,
    type HTMLMotionProps,
    type Variants,
} from "framer-motion";

const DEFAULT_DURATION = 0.55;

const viewport = {
    once: true,
    amount: 0.2,
};

export const fadeInVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: DEFAULT_DURATION,
            ease: "easeOut",
        },
    },
};

export const fadeUpVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 32,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DEFAULT_DURATION,
            ease: "easeOut",
        },
    },
};

export const scaleInVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.94,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: DEFAULT_DURATION,
            ease: "easeOut",
        },
    },
};

export const staggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

interface MotionProps extends HTMLMotionProps<"div"> { }

export function FadeIn({
    children,
    ...props
}: MotionProps) {
    return (
        <motion.div
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function FadeUp({
    children,
    ...props
}: MotionProps) {
    return (
        <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({
    children,
    ...props
}: MotionProps) {
    return (
        <motion.div
            variants={scaleInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({
    children,
    ...props
}: MotionProps) {
    return (
        <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {Array.isArray(children)
                ? children.map((child, index) => (
                    <div key={index}>{child}</div>
                ))
                : children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    ...props
}: MotionProps) {
    return (
        <motion.div
            variants={fadeUpVariants}
            {...props}
        >
            {children}
        </motion.div>
    );
}