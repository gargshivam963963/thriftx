"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckoutStepStatus = "complete" | "current" | "pending";

interface CheckoutProgressProps {
    /** 1-based index of the step the customer is on. */
    currentStep: number;
    totalSteps: number;
    /** Per-step state, in step order (0-based array). */
    statuses: CheckoutStepStatus[];
    /** Short labels — kept to one word so they never wrap at 320px. */
    labels: string[];
    className?: string;
}

/**
 * CheckoutProgress — a slim, mobile-first progress rail.
 *
 * Replaces the previous "CHECKOUT PROGRESS / Step 3 of 3 / 100% complete"
 * card which consumed ~250px of a 375px phone screen while duplicating the
 * step accordion headers directly beneath it.
 *
 * It is now one compact row: labelled dots joined by a track, plus a single
 * screen-reader status line. Labels appear from `sm` up so the rail can never
 * wrap at 320px.
 */
export function CheckoutProgress({
    currentStep,
    totalSteps,
    statuses,
    labels,
    className,
}: CheckoutProgressProps) {
    const reduceMotion = useReducedMotion();

    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center gap-1.5 sm:gap-2">
                {statuses.map((status, index) => {
                    const stepNumber = index + 1;
                    const isDone = status === "complete";
                    const isCurrent = status === "current";

                    return (
                        <div
                            key={stepNumber}
                            className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2"
                        >
<span className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                                <motion.span
                                    initial={false}
                                    animate={{
                                        scale:
                                            isCurrent && !reduceMotion
                                                ? 1.08
                                                : 1,
                                    }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                    }}
                                    aria-hidden="true"
                                    className={cn(
                                        "flex size-6 shrink-0 items-center justify-center rounded-full text-badge font-bold transition-colors duration-200 sm:size-7",
                                        isDone && "bg-success text-white",
                                        isCurrent &&
                                            "bg-foreground text-background",
                                        status === "pending" &&
                                            "bg-muted text-muted-foreground",
                                    )}
                                >
                                    {isDone ? (
                                        <Check
                                            className="size-3.5"
                                            strokeWidth={3}
                                        />
                                    ) : (
                                        stepNumber
                                    )}
                                </motion.span>

                                <span
                                    className={cn(
                                        "hidden truncate text-label sm:inline",
                                        isCurrent
                                            ? "font-semibold text-foreground"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {labels[index]}
                                </span>
                            </span>

                            {index < totalSteps - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="h-0.5 min-w-2 flex-1 overflow-hidden rounded-full bg-muted"
                                >
                                    <motion.span
                                        initial={false}
                                        animate={{
                                            scaleX: isDone ? 1 : 0,
                                        }}
                                        style={{ originX: 0 }}
                                        transition={
                                            reduceMotion
                                                ? { duration: 0 }
                                                : {
                                                      duration: 0.35,
                                                      ease: "easeOut",
                                                  }
                                        }
                                        className="block h-full w-full rounded-full bg-success"
                                    />
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <p role="status" aria-live="polite" className="sr-only">
                Step {currentStep} of {totalSteps}:{" "}
                {labels[currentStep - 1]}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-3 sm:hidden">
                <p className="truncate text-label font-semibold text-foreground">
                    {labels[currentStep - 1]}
                </p>
                <p className="shrink-0 text-small tabular-nums text-muted-foreground">
                    Step {currentStep}/{totalSteps}
                </p>
            </div>
        </div>
    );
}

export default CheckoutProgress;