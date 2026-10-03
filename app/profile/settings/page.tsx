
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    LockKeyhole,
    LogOut,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField, Input, PasswordField } from "@/components/ui/form";
import { useAuth } from "@/lib/AuthContext";
import { authClient } from "@/lib/auth-client";
import { getFriendlyError } from "@/lib/errors";
import { useTheme } from "@/lib/ThemeContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout, refreshUser } = useAuth();
    const { theme, setTheme } = useTheme();

    const [name, setName] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [profileError, setProfileError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (user) setName(user.name || "");
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login?redirect=/profile/settings");
        }
    }, [authLoading, user, router]);

    const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedName = name.trim();

        if (normalizedName.length < 2) {
            setProfileError("Name must be at least 2 characters.");
            return;
        }

        setProfileSaving(true);
        setProfileError("");

        try {
            const response = await authClient.updateUser({
                name: normalizedName,
            });

            if (response.error) throw response.error;

            await refreshUser();
            toast.success("Profile updated.");
        } catch (err) {
            setProfileError(
                getFriendlyError(err, "Unable to update your profile.")
            );
        } finally {
            setProfileSaving(false);
        }
    };

    const changePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (newPassword.length < 8) {
            setPasswordError("New password must contain at least 8 characters.");
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            setPasswordError(
                "Use at least one uppercase letter, lowercase letter, and number."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        setPasswordSaving(true);
        setPasswordError("");

        try {
            const response = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            });

            if (response.error) throw response.error;

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success("Password changed successfully.");
        } catch (err) {
            setPasswordError(
                getFriendlyError(
                    err,
                    "Unable to change your password. Check your current password and try again."
                )
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);

        try {
            await logout();
            router.replace("/");
        } catch (err) {
            toast.error(getFriendlyError(err, "Unable to sign out."));
        } finally {
            setLoggingOut(false);
        }
    };

    if (authLoading || !user) {
        return (
            <main className="min-h-[60svh] bg-background px-4 py-10">
                <div className="mx-auto max-w-3xl space-y-5">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
                    <div className="h-52 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-72 animate-pulse rounded-2xl bg-muted" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-7 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-3xl">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-7 flex items-center gap-3"
                >
                    <Link
                        href="/profile"
                        aria-label="Back to profile"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
                    >
                        <ArrowLeft size={17} aria-hidden="true" />
                    </Link>

                    <div>
                        <h1 className="text-heading-3 font-bold text-foreground">
                            Account Settings
                        </h1>
                        <p className="text-body-sm text-muted-foreground">
                            Manage your profile and account security.
                        </p>
                    </div>
                </motion.header>

                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                    <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                            <UserRound size={18} aria-hidden="true" />
                        </div>

                        <div>
                            <h2 className="text-body font-semibold text-foreground">
                                Profile Information
                            </h2>
                            <p className="text-small text-muted-foreground">
                                Update your account name.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={saveProfile}
                        className="space-y-5 p-5 sm:p-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
                                {(user.name || user.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-body-sm font-medium text-foreground">
                                    {user.name}
                                </p>
                                <p className="truncate text-small text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <FormField
                            label="Full Name"
                            htmlFor="profile-name"
                            required
                        >
                            <Input
                                id="profile-name"
                                name="name"
                                autoComplete="name"
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setProfileError("");
                                }}
                                minLength={2}
                                maxLength={100}
                                required
                                disabled={profileSaving}
                            />
                        </FormField>

                        <FormField
                            label="Email Address"
                            htmlFor="profile-email"
                        >
                            <Input
                                id="profile-email"
                                type="email"
                                value={user.email || ""}
                                readOnly
                                disabled
                            />
                            <p className="mt-1 text-small text-muted-foreground">
                                Email changes require a separate verification
                                flow.
                            </p>
                        </FormField>

                        {profileError && (
                            <p role="alert" className="text-body-sm text-error">
                                {profileError}
                            </p>
                        )}

                        <div className="flex justify-end border-t border-border pt-4">
                            <Button
                                type="submit"
                                loading={profileSaving}
                                loadingText="Saving..."
                                disabled={
                                    profileSaving ||
                                    name.trim().length < 2 ||
                                    name.trim() === user.name
                                }
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                    <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                            <ShieldCheck size={18} aria-hidden="true" />
                        </div>

                        <div>
                            <h2 className="text-body font-semibold text-foreground">
                                Security
                            </h2>
                            <p className="text-small text-muted-foreground">
                                Change your account password.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={changePassword}
                        className="space-y-5 p-5 sm:p-6"
                    >
                        <FormField
                            label="Current Password"
                            htmlFor="current-password"
                            required
                        >
                            <PasswordField
                                id="current-password"
                                name="currentPassword"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(event) => {
                                    setCurrentPassword(event.target.value);
                                    setPasswordError("");
                                }}
                                required
                                disabled={passwordSaving}
                            />
                        </FormField>

                        <FormField
                            label="New Password"
                            htmlFor="new-password"
                            required
                            helper="At least 8 characters, including uppercase, lowercase, and a number."
                        >
                            <PasswordField
                                id="new-password"
                                name="newPassword"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(event) => {
                                    setNewPassword(event.target.value);
                                    setPasswordError("");
                                }}
                                minLength={8}
                                maxLength={128}
                                required
                                disabled={passwordSaving}
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
                                value={confirmPassword}
                                onChange={(event) => {
                                    setConfirmPassword(event.target.value);
                                    setPasswordError("");
                                }}
                                minLength={8}
                                maxLength={128}
                                required
                                disabled={passwordSaving}
                            />
                        </FormField>

                        {passwordError && (
                            <p role="alert" className="text-body-sm text-error">
                                {passwordError}
                            </p>
                        )}

                        <div className="flex justify-end border-t border-border pt-4">
                            <Button
                                type="submit"
                                loading={passwordSaving}
                                loadingText="Updating Password..."
                                leftIcon={<LockKeyhole size={16} />}
                                disabled={
                                    passwordSaving ||
                                    !currentPassword ||
                                    newPassword.length < 8 ||
                                    !confirmPassword
                                }
                            >
                                Update Password
                            </Button>
                        </div>
                    </form>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                    <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                            <CheckCircle2 size={18} aria-hidden="true" />
                        </div>

                        <div>
                            <h2 className="text-body font-semibold text-foreground">
                                Appearance
                            </h2>
                            <p className="text-small text-muted-foreground">
                                Choose your preferred theme.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                        <div>
                            <p className="text-body-sm font-medium text-foreground">
                                Theme Preference
                            </p>
                            <p className="text-small text-muted-foreground">
                                Choose between System (follows device), Light, or Dark mode.
                            </p>
                        </div>

                        <div className="w-full sm:w-auto">
                            <ThemeToggle variant="segmented" size="md" />
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
                >
                    <h2 className="text-body font-semibold text-foreground">
                        Sign Out
                    </h2>

                    <p className="mt-1 text-body-sm text-muted-foreground">
                        Sign out of your THRIFTX account on this device.
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        fullWidth
                        className="mt-5"
                        leftIcon={<LogOut size={16} />}
                        loading={loggingOut}
                        loadingText="Signing Out..."
                        onClick={handleLogout}
                    >
                        Sign Out
                    </Button>
                </motion.section>

                <p className="mt-8 text-center text-small text-muted-foreground">
                    THRIFTX · Account Security
                </p>
            </div>
        </main>
    );
}