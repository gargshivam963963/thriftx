
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField, PasswordField } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { getFriendlyError } from "@/lib/errors";

function ResetPasswordForm() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            setError("This password reset link is missing its token. Request a new link to continue.");
            return;
        }

        if (password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authClient.resetPassword({
                token,
                newPassword: password,
            });

            if (response.error) {
                throw response.error;
            }

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                getFriendlyError(
                    err,
                    "We couldn't reset your password. The link may have expired."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container-tight mx-auto flex min-h-[70svh] items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-modal sm:p-8"
                >
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                        <CheckCircle2 size={27} aria-hidden="true" />
                    </div>

                    <h1 className="text-heading-2 text-foreground">
                        Password updated
                    </h1>

                    <p className="mt-3 text-body-sm text-muted-foreground">
                        Your password has been changed. You can now sign in
                        using your new password.
                    </p>

                    <Button
                        type="button"
                        size="lg"
                        fullWidth
                        className="mt-7"
                        rightIcon={<ArrowRight size={17} />}
                        onClick={() => router.replace("/login")}
                    >
                        Continue to Login
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container-tight mx-auto flex min-h-[70svh] items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-modal sm:p-8"
            >
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
                        <ShieldCheck size={24} aria-hidden="true" />
                    </div>

                    <h1 className="text-heading-2 text-foreground">
                        Reset Password
                    </h1>

                    <p className="mt-2 text-subtitle">
                        Choose a new password to secure your THRIFTX account.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 flex items-start gap-3 rounded-xl border border-error/30 bg-error-bg p-4 text-body-sm text-error-foreground"
                    >
                        <X
                            size={16}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>{error}</span>
                    </div>
                )}

                {!token ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                        <p className="text-body-sm text-muted-foreground">
                            This reset link is incomplete or invalid. Request
                            a new password reset link to continue.
                        </p>

                        <Button
                            asChild
                            variant="outline"
                            fullWidth
                            className="mt-4"
                        >
                            <Link href="/forgot-password">
                                Request a New Link
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                        noValidate
                    >
                        <FormField
                            label="New Password"
                            htmlFor="new-password"
                            required
                            helper="Use at least 8 characters."
                        >
                            <PasswordField
                                id="new-password"
                                name="newPassword"
                                autoComplete="new-password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setError("");
                                }}
                                required
                                minLength={8}
                                maxLength={128}
                                disabled={loading}
                            />
                        </FormField>

                        <FormField
                            label="Confirm New Password"
                            htmlFor="confirm-password"
                            required
                        >
                            <PasswordField
                                id="confirm-password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                placeholder="Re-enter your new password"
                                value={confirmPassword}
                                onChange={(event) => {
                                    setConfirmPassword(event.target.value);
                                    setError("");
                                }}
                                required
                                minLength={8}
                                maxLength={128}
                                disabled={loading}
                            />
                        </FormField>

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={loading}
                            loadingText="Updating Password..."
                            rightIcon={<ArrowRight size={17} />}
                            disabled={
                                loading ||
                                !password ||
                                !confirmPassword ||
                                password !== confirmPassword
                            }
                        >
                            Set New Password
                        </Button>
                    </form>
                )}

                <p className="mt-6 text-center text-body-sm text-muted-foreground">
                    Remembered your password?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                    >
                        Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="container-tight mx-auto flex min-h-[70svh] items-center justify-center px-4 py-12">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground"
                        role="status"
                        aria-label="Loading password reset"
                    />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}