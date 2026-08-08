"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Loader2, ShieldCheck, X } from "lucide-react";
import { OAuthProvider } from "appwrite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormField, Input, PasswordField } from "@/components/ui/form";
import { account } from "@/lib/appwrite";
import { useAuth } from "@/lib/AuthContext";
import { getFriendlyError } from "@/lib/errors";

// ─── Validation Schema ───────────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().trim().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Login() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [remember, setRemember] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    useEffect(() => {
        if (!authLoading && user) {
            router.replace("/");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        const savedEmail = localStorage.getItem("thriftx-email");
        if (savedEmail) {
            return;
        }
    }, []);

    const onSubmit = async (values: LoginValues) => {
        try {
            await account.createEmailPasswordSession(values.email, values.password);
            if (remember) {
                localStorage.setItem("thriftx-email", values.email);
            } else {
                localStorage.removeItem("thriftx-email");
            }
            await refreshUser();
            router.replace("/");
        } catch (err) {
            setError("root", {
                type: "manual",
                message: getFriendlyError(err, "Incorrect email or password."),
            });
        }
    };

    const handleForgotPassword = async () => {
        const email = (document.getElementById("email") as HTMLInputElement)?.value;
        if (!email) {
            setError("email", { type: "manual", message: "Enter your email first." });
            return;
        }
        try {
            await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`,
            );
            setError("root", {
                type: "manual",
                message: "Recovery email sent successfully.",
            });
        } catch (err) {
            setError("root", {
                type: "manual",
                message: getFriendlyError(err, "Unable to send recovery email."),
            });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await account.createOAuth2Session(
                OAuthProvider.Google,
                `${window.location.origin}/`,
                `${window.location.origin}/login`,
            );
        } catch (err) {
            setError("root", {
                type: "manual",
                message: getFriendlyError(err, "Unable to continue with Google."),
            });
        }
    };

    if (authLoading || user) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 text-center"
                >
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    <p className="text-body-sm text-muted-foreground">
                        Loading your account...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden">
            {/* Background blur elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-20 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-muted blur-[120px] sm:h-[420px] sm:w-[420px] dark:bg-card" />
                <div className="absolute bottom-0 right-0 h-[200px] w-[200px] rounded-full bg-muted blur-[120px] sm:h-[300px] sm:w-[300px] dark:bg-card/50" />
            </div>

            <div className="container-tight mx-auto flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="w-full max-w-lg"
                >
                    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-modal backdrop-blur-xl sm:p-8 md:p-10 dark:bg-card/90">
                        {/* Header */}
                        <div className="mb-6 text-center sm:mb-10">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg sm:h-16 sm:w-16"
                            >
                                <ShieldCheck size={24} className="sm:h-[30px] sm:w-[30px]" />
                            </motion.div>
                            <h1 className="text-heading-2 text-foreground">Welcome Back</h1>
                            <p className="mt-2 text-subtitle">
                                Continue your premium thrift shopping experience.
                            </p>
                        </div>

                        {/* Root message / error */}
                        <AnimatePresence>
                            {errors.root?.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-5 flex items-start gap-3 rounded-xl border border-error/30 bg-error-bg p-4 text-body-sm text-error-foreground"
                                >
                                    <X size={16} className="mt-0.5 shrink-0" />
                                    <span>{errors.root.message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Google OAuth */}
                        <Button
                            variant="outline"
                            size="lg"
                            fullWidth
                        >
                            <svg width="20" height="20" viewBox="0 0 48 48">
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
                            Continue with Google
                        </Button>

                        {/* OR Divider */}
                        <div className="relative mb-5 sm:mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-card px-4 text-caption text-muted-foreground">
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
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
                                    placeholder="Enter your email"
                                    error={!!errors.email}
                                    {...register("email")}
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
                                        className="text-label font-semibold text-muted-foreground hover:text-foreground"
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
                                    {...register("password")}
                                />
                            </FormField>

                            {/* Remember me & secure badge */}
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="h-4 w-4 rounded border-border"
                                    />
                                    <span className="text-body-sm text-muted-foreground">
                                        Remember me
                                    </span>
                                </label>
                                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-small font-medium text-muted-foreground">
                                    <ShieldCheck size={12} />
                                    Secure Login
                                </span>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                fullWidth
                                loading={isSubmitting}
                                loadingText="Signing In..."
                                rightIcon={<ArrowRight size={17} />}
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* THRIFTX Divider */}
                        <div className="my-6 flex items-center gap-4 sm:my-8">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-caption text-muted-foreground">THRIFTX</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        {/* Already have account */}
                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-center text-body-sm text-muted-foreground">
                                Don&apos;t have an account yet?
                            </p>
                            <Link
                                href="/signup"
                                className="flex h-12 w-full items-center justify-center rounded-xl border border-border text-body-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
