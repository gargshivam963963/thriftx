
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import {
    ArrowRight,
    Loader2,
    ShieldCheck,
    X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { accordionVariants } from "@/components/animations/Motion";
import {
    FormField,
    Input,
    PasswordField,
} from "@/components/ui/form";
import { useAuth } from "@/lib/AuthContext";
import { useGoogleAuthEnabled } from "@/lib/useGoogleAuthEnabled";
import { authClient } from "@/lib/auth-client";
import { getFriendlyError } from "@/lib/errors";

const loginSchema = z.object({
    email: z.string().trim().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

type RootMessage = {
    type: "error" | "success";
    message: string;
};

/**
 * Only allow same-origin, internal redirect targets.
 * Blocks open-redirect attempts (e.g. `//evil.com`, `https://evil.com`).
 */
function getSafeRedirect(raw: string | null): string {
    if (!raw) return "/";
    if (!raw.startsWith("/")) return "/";
    if (raw.startsWith("//")) return "/";
    if (raw.includes(":")) return "/";
    return raw;
}

function LoginForm() {
    const router = useRouter();
    const {
        user,
        loading: authLoading,
        refreshUser,
    } = useAuth();

    const [remember, setRemember] = useState(true);
    const [googleLoading, setGoogleLoading] = useState(false);
    const googleEnabled = useGoogleAuthEnabled();
    const searchParams = useSearchParams();
    const redirectTo = getSafeRedirect(searchParams.get("redirect"));
    const [rootMessage, setRootMessage] =
        useState<RootMessage | null>(null);

    const {
        register,
        handleSubmit,
        getValues,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (!authLoading && user) {
            router.replace(redirectTo);
        }
    }, [authLoading, user, router, redirectTo]);

    useEffect(() => {
        const savedEmail = localStorage.getItem("thriftx-email");

        if (savedEmail) {
            setValue("email", savedEmail);
        }
    }, [setValue]);

    const clearRootMessage = () => {
        setRootMessage(null);
    };

    const onSubmit = async (values: LoginValues) => {
        clearRootMessage();

        try {
            const response = await authClient.signIn.email({
                email: values.email,
                password: values.password,
                rememberMe: remember,
                callbackURL: redirectTo,
            });

            if (response.error) {
                throw response.error;
            }

            if (remember) {
                localStorage.setItem("thriftx-email", values.email);
            } else {
                localStorage.removeItem("thriftx-email");
            }

            await refreshUser();
            router.replace(redirectTo);
        } catch (err) {
            const message = getFriendlyError(
                err,
                "Incorrect email or password.",
            );

            setError("root", {
                type: "manual",
                message,
            });

            setRootMessage({
                type: "error",
                message,
            });
        }
    };

    const handleForgotPassword = async () => {
        clearRootMessage();

        const email = getValues("email").trim();

        if (!email) {
            setError("email", {
                type: "manual",
                message: "Enter your email first.",
            });
            return;
        }

        const emailValidation = z.string().email().safeParse(email);

        if (!emailValidation.success) {
            setError("email", {
                type: "manual",
                message: "Please enter a valid email.",
            });
            return;
        }

        try {
            const response = await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (response.error) {
                throw response.error;
            }

            setRootMessage({
                type: "success",
                message:
                    "Request accepted. If an account exists and email delivery succeeds, a reset link will arrive.",
            });
        } catch (err) {
            setRootMessage({
                type: "error",
                message: getFriendlyError(
                    err,
                    "Unable to send recovery email.",
                ),
            });
        }
    };

    const handleGoogleLogin = async () => {
        if (googleLoading || isSubmitting) return;

        clearRootMessage();
        setGoogleLoading(true);

        try {
            const response = await authClient.signIn.social({
                provider: "google",
                callbackURL: redirectTo,
            });

            if (response.error) {
                throw response.error;
            }
        } catch (err) {
            setGoogleLoading(false);

            setRootMessage({
                type: "error",
                message: getFriendlyError(
                    err,
                    "Unable to continue with Google.",
                ),
            });
        }
    };

    if (authLoading || user) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 text-center"
                >
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />

                    <p className="text-body-sm text-muted-foreground">
                        Loading your account...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-var(--header-height,0px))] overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
                aria-hidden="true"
            >
                <div className="absolute left-1/2 top-16 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-muted/70 blur-[120px] sm:h-[360px] sm:w-[360px]" />

                <div className="absolute bottom-0 right-0 h-[220px] w-[220px] rounded-full bg-muted/40 blur-[120px] sm:h-[300px] sm:w-[300px]" />
            </div>

            <main className="mx-auto flex min-h-[calc(100vh-var(--header-height,0px))] w-full max-w-[1440px] items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8 xl:px-10">
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut",
                    }}
                    className="w-full max-w-[560px]"
                    aria-labelledby="login-title"
                >
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-modal sm:p-8 md:p-9">
                        <div className="mb-7 text-center sm:mb-8">
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.92,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                transition={{
                                    delay: 0.08,
                                    duration: 0.3,
                                }}
                                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg sm:h-15 sm:w-15"
                            >
                                <ShieldCheck
                                    className="h-6 w-6 sm:h-7 sm:w-7"
                                    strokeWidth={2}
                                />
                            </motion.div>

                            <h1
                                id="login-title"
                                className="text-heading-2 font-semibold tracking-tight text-foreground"
                            >
                                Welcome Back
                            </h1>

                            <p className="mt-2 text-subtitle text-muted-foreground">
                                Continue your premium thrift shopping
                                experience.
                            </p>
                        </div>

                        <AnimatePresence initial={false}>
                            {rootMessage && (
                                <motion.div
                                    variants={accordionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="mb-5 overflow-hidden"
                                >
                                    <div
                                        role={
                                            rootMessage.type === "error"
                                                ? "alert"
                                                : "status"
                                        }
                                        className={[
                                            "flex items-start gap-3 rounded-xl border p-3.5 text-body-sm",
                                            rootMessage.type === "error"
                                                ? "border-error/30 bg-error-bg text-error-foreground"
                                                : "border-success/30 bg-success/10 text-success",
                                        ].join(" ")}
                                    >
                                        {rootMessage.type === "error" ? (
                                            <X
                                                className="mt-0.5 h-4 w-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <ShieldCheck
                                                className="mt-0.5 h-4 w-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                        )}

                                        <span>{rootMessage.message}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {googleEnabled !== false && (
<>
<Button
                            type="button"
                            variant="outline"
                            size="lg"
                            fullWidth
                            loading={googleLoading}
                            loadingText="Connecting..."
                            disabled={isSubmitting || googleLoading}
                            onClick={handleGoogleLogin}
                            className="h-13 border-border bg-background text-button font-medium hover:bg-muted"
                        >
                            {!googleLoading && (
                                <svg
                                    width="19"
                                    height="19"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill="#FFC107"
                                        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.215 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                                    />
                                    <path
                                        fill="#FF3D00"
                                        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                                    />
                                    <path
                                        fill="#4CAF50"
                                        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.146 35.091 26.715 36 24 36c-5.194 0-9.623-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                                    />
                                    <path
                                        fill="#1976D2"
                                        d="M43.611 20.083L43.595 20H24v8h11.303c-1.08 3.091-3.309 5.548-6.084 7.071l.003-.002 6.19 5.238C35.004 40.078 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                                    />
                                </svg>
                            )}

                            {!googleLoading && "Continue with Google"}
                        </Button>

                        <div
                            className="relative my-5 sm:my-6"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>

                            <div className="relative flex justify-center">
                                <span className="bg-card px-4 text-caption font-medium text-muted-foreground">
                                    OR
                                </span>
                            </div>
                        </div>
</>
)}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5 sm:space-y-6"
                        >
                            <FormField
                                label="Email Address"
                                htmlFor="email"
                                error={errors.email?.message}
                                required
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    inputMode="email"
                                    placeholder="Enter your email"
                                    error={!!errors.email}
                                    {...register("email", {
                                        onChange: clearRootMessage,
                                    })}
                                />
                            </FormField>

                            <FormField
                                label="Password"
                                htmlFor="password"
                                error={errors.password?.message}
                                required
                                trailing={
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleForgotPassword}
                                        className="text-label font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Forgot Password?
                                    </Button>
                                }
                            >
                                <PasswordField
                                    id="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    error={!!errors.password}
                                    showLock={false}
                                    {...register("password", {
                                        onChange: clearRootMessage,
                                    })}
                                />
                            </FormField>

                            <div className="flex items-center justify-between gap-4">
                                <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(event) => {
                                            setRemember(
                                                event.target.checked,
                                            );
                                            clearRootMessage();
                                        }}
                                        className="h-4 w-4 rounded border-border accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />

                                    <span className="text-body-sm text-muted-foreground">
                                        Remember me
                                    </span>
                                </label>

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-small font-medium text-muted-foreground">
                                    <ShieldCheck
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Secure Login
                                </span>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                fullWidth
                                loading={isSubmitting}
                                loadingText="Signing In..."
                                disabled={googleLoading}
                                rightIcon={
                                    !isSubmitting ? (
                                        <ArrowRight
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    ) : undefined
                                }
                                className="h-13"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="my-7 flex items-center gap-4 sm:my-8">
                            <div className="h-px flex-1 bg-border" />

                            <span className="text-caption font-medium tracking-wide text-muted-foreground">
                                THRIFTX
                            </span>

                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <div className="space-y-3">
                            <p className="text-center text-body-sm text-muted-foreground">
                                Don&apos;t have an account yet?
                            </p>

                            <Link
                                href="/signup"
                                className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-transparent text-button font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}