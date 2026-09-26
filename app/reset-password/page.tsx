"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField, PasswordField } from "@/components/ui/form";
import { getFriendlyError } from "@/lib/errors";

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            setError("This reset link is missing a valid token.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.message || "Unable to reset password.");
            }

            setSuccess("Your password has been reset. Redirecting to login...");
            setTimeout(() => router.replace("/login"), 1500);
        } catch (err) {
            setError(getFriendlyError(err, "Unable to reset password."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-tight mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-modal sm:p-8"
            >
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-heading-2 text-foreground">Reset Password</h1>
                    <p className="mt-2 text-subtitle">Choose a new secure password for your account.</p>
                </div>

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-error/30 bg-error-bg p-4 text-body-sm text-error-foreground">
                        <X size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-success/30 bg-success/10 p-4 text-body-sm text-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField label="New Password" htmlFor="password" required>
                        <PasswordField
                            id="password"
                            autoComplete="new-password"
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </FormField>

                    <Button type="submit" size="lg" fullWidth loading={loading} loadingText="Resetting..." rightIcon={<ArrowRight size={17} />}>
                        Set New Password
                    </Button>
                </form>

                {!token && (
                    <p className="mt-4 text-center text-body-sm text-muted-foreground">
                        This reset page needs a valid token from your email link.
                    </p>
                )}
            </motion.div>
        </div>
    );
}
