"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    User,
    Lock,
    Eye,
    EyeOff,
    Save,
    AlertTriangle,
    LogOut,
    Check,
    ShieldCheck,
    Bell,
    Sparkles,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/ui/FloatingInput";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/utils";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email"),
    phone: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number")
        .or(z.literal("")),
});

const passwordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(6, "Password must be at least 6 characters"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Must contain uppercase, lowercase & number",
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SettingsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            </div>
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-48 animate-pulse rounded-2xl bg-muted"
                />
            ))}
        </div>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
    icon,
    title,
    subtitle,
    children,
    className,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-modal",
                className,
            )}
        >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background sm:h-10 sm:w-10">
                    {icon}
                </div>
                <div>
                    <h3 className="text-body-sm font-semibold text-foreground sm:text-body">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-small text-muted-foreground sm:text-body-sm">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </motion.div>
    );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
    enabled,
    onChange,
    label,
    description,
}: {
    enabled: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-body-sm font-medium text-foreground">{label}</p>
                <p className="text-small text-muted-foreground">{description}</p>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="iconSm"
                onClick={() => onChange(!enabled)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors p-0",
                    enabled ? "bg-foreground" : "bg-muted",
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
                        enabled ? "translate-x-5" : "translate-x-0",
                    )}
                />
            </Button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);

    // Notifications / preferences
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [smsNotifs, setSmsNotifs] = useState(false);
    const [darkMode, setDarkMode] = useState(theme === "dark");

    // Delete account confirmation
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteText, setDeleteText] = useState("");

    // ── Profile Form ──────────────────────────────────────────────────────────
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        reset: resetProfile,
        formState: { errors: profileErrors, isDirty: profileDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (user) {
            resetProfile({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user, resetProfile]);

    useEffect(() => {
        setDarkMode(theme === "dark");
    }, [theme]);

    useEffect(() => {
        setTheme(darkMode ? "dark" : "light");
    }, [darkMode, setTheme]);

    // ── Password Form ─────────────────────────────────────────────────────────
    const {
        register: registerPw,
        handleSubmit: handlePwSubmit,
        reset: resetPw,
        formState: { errors: pwErrors },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    // ── Redirect if not logged in ─────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/profile/settings");
        }
    }, [authLoading, user, router]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const onProfileSave = async (data: ProfileFormValues) => {
        try {
            setProfileSaving(true);
            // Simulate API call
            await new Promise((r) => setTimeout(r, 1200));
            toast.success("Profile updated successfully!");
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setProfileSaving(false);
        }
    };

    const onPasswordChange = async (data: PasswordFormValues) => {
        try {
            setPasswordSaving(true);
            await new Promise((r) => setTimeout(r, 1200));
            toast.success("Password changed successfully!");
            resetPw();
        } catch {
            toast.error("Failed to change password.");
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Signed out successfully.");
            router.push("/");
        } catch {
            toast.error("Failed to sign out.");
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteText !== "DELETE") return;
        try {
            toast.success("Account deleted. We're sorry to see you go.");
            await logout();
            router.push("/");
        } catch {
            toast.error("Failed to delete account.");
        }
    };

    if (authLoading) {
        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
                    <SettingsSkeleton />
                </div>
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
                {/* ── Header ────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:border-foreground hover:bg-foreground hover:text-background"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="font-display text-heading-4 font-bold text-foreground">
                                Account Settings
                            </h1>
                            <p className="text-small text-muted-foreground sm:text-body-sm">
                                Manage your profile, security &amp; preferences
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ── Profile Information ─────────────────────────────────── */}
                <form onSubmit={handleProfileSubmit(onProfileSave)}>
                    <SectionCard
                        icon={<User size={18} />}
                        title="Profile Information"
                        subtitle="Update your name, email & contact details"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 pb-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-xl font-bold text-background shadow-lg sm:h-16 sm:w-16 sm:text-2xl">
                                    {(user.name || user.email || "U")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-body-sm font-semibold text-foreground">
                                        {user.name || "User"}
                                    </p>
                                    <p className="text-small text-muted-foreground">
                                        {user.email || ""}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FloatingInput
                                    label="Full Name"
                                    error={profileErrors.name?.message}
                                    {...registerProfile("name")}
                                />
                                <FloatingInput
                                    label="Email Address"
                                    type="email"
                                    error={profileErrors.email?.message}
                                    {...registerProfile("email")}
                                />
                            </div>

                            <FloatingInput
                                label="Phone Number"
                                type="tel"
                                maxLength={10}
                                error={profileErrors.phone?.message}
                                {...registerProfile("phone")}
                            />

                            <div className="flex justify-end border-t border-border pt-4">
                                <Button
                                    type="submit"
                                    loading={profileSaving}
                                    disabled={!profileDirty}
                                    leftIcon={<Save size={16} />}
                                    className="rounded-xl"
                                >
                                    {profileSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </SectionCard>
                </form>

                {/* ── Change Password ─────────────────────────────────────── */}
                <form onSubmit={handlePwSubmit(onPasswordChange)}>
                    <SectionCard
                        icon={<Lock size={18} />}
                        title="Change Password"
                        subtitle="Update your account password"
                        className="mt-4 sm:mt-5"
                    >
                        <div className="space-y-4">
                            <div className="relative">
                                <FloatingInput
                                    label="Current Password"
                                    type={showCurrentPw ? "text" : "password"}
                                    error={pwErrors.currentPassword?.message}
                                    {...registerPw("currentPassword")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="iconSm"
                                    onClick={() =>
                                        setShowCurrentPw(!showCurrentPw)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showCurrentPw ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="relative">
                                    <FloatingInput
                                        label="New Password"
                                        type={showNewPw ? "text" : "password"}
                                        error={pwErrors.newPassword?.message}
                                        {...registerPw("newPassword")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="iconSm"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPw ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </Button>
                                </div>
                                <div className="relative">
                                    <FloatingInput
                                        label="Confirm Password"
                                        type={
                                            showConfirmPw ? "text" : "password"
                                        }
                                        error={
                                            pwErrors.confirmPassword?.message
                                        }
                                        {...registerPw("confirmPassword")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="iconSm"
                                        onClick={() =>
                                            setShowConfirmPw(!showConfirmPw)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPw ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Password requirements hint */}
                            <div className="rounded-xl bg-muted px-4 py-3 text-small text-muted-foreground">
                                <p className="mb-1 font-medium text-foreground">
                                    Password must contain:
                                </p>
                                <ul className="space-y-0.5">
                                    <li className="flex items-center gap-1.5">
                                        <Check size={10} className="text-success" />
                                        At least 8 characters
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <Check size={10} className="text-success" />
                                        One uppercase letter
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <Check size={10} className="text-success" />
                                        One lowercase letter
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <Check size={10} className="text-success" />
                                        One number
                                    </li>
                                </ul>
                            </div>

                            <div className="flex justify-end border-t border-border pt-4">
                                <Button
                                    type="submit"
                                    loading={passwordSaving}
                                    leftIcon={<Lock size={16} />}
                                    className="rounded-xl"
                                >
                                    {passwordSaving
                                        ? "Updating..."
                                        : "Update Password"}
                                </Button>
                            </div>
                        </div>
                    </SectionCard>
                </form>

                {/* ── Preferences ──────────────────────────────────────────── */}
                <SectionCard
                    icon={<Bell size={18} />}
                    title="Preferences"
                    subtitle="Notification & display settings"
                    className="mt-4 sm:mt-5"
                >
                    <div className="space-y-5">
                        <ToggleSwitch
                            enabled={emailNotifs}
                            onChange={setEmailNotifs}
                            label="Email Notifications"
                            description="Receive order updates & offers via email"
                        />
                        <div className="h-px bg-border" />
                        <ToggleSwitch
                            enabled={smsNotifs}
                            onChange={setSmsNotifs}
                            label="SMS Notifications"
                            description="Get delivery updates on your phone"
                        />
                        <div className="h-px bg-border" />
                        <ToggleSwitch
                            enabled={darkMode}
                            onChange={setDarkMode}
                            label="Dark Mode"
                            description="Use dark theme across the app"
                        />
                    </div>
                </SectionCard>

                {/* ── Account Actions ──────────────────────────────────────── */}
                <SectionCard
                    icon={<ShieldCheck size={18} />}
                    title="Account Actions"
                    subtitle="Sign out or manage your account"
                    className="mt-4 sm:mt-5"
                >
                    <div className="space-y-4">
                        <Button
                            type="button"
                            onClick={handleLogout}
                            variant="outline"
                            fullWidth
                            leftIcon={<LogOut size={16} />}
                            className="rounded-xl"
                        >
                            Sign Outsf sdf
                        </Button>
                    </div>
                </SectionCard>

                {/* ── Danger Zone ──────────────────────────────────────────── */}
                <SectionCard
                    icon={<AlertTriangle size={18} />}
                    title="Danger Zone"
                    subtitle="Irreversible actions"
                    className="mt-4 border-error/30 sm:mt-5"
                >
                    <div className="space-y-4">
                        <AnimatePresence>
                            {!deleteConfirm ? (
                                <motion.div
                                    key="delete-btn"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Button
                                        type="button"
                                        variant="danger"
                                        fullWidth
                                        leftIcon={<Trash2 size={16} />}
                                        className="rounded-xl"
                                        onClick={() => setDeleteConfirm(true)}
                                    >
                                        Delete Account
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="delete-confirm"
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="space-y-3 rounded-2xl border border-error/30 bg-error-bg p-4"
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle
                                            size={16}
                                            className="mt-0.5 shrink-0 text-error-foreground"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-error-foreground">
                                                Are you absolutely sure?
                                            </p>
                                            <p className="mt-1 text-xs text-error-foreground">
                                                This will permanently delete your
                                                account and all associated data.
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>

                                    <FloatingInput
                                        label='Type "DELETE" to confirm'
                                        value={deleteText}
                                        onChange={(e) =>
                                            setDeleteText(e.target.value)
                                        }
                                    />

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            fullWidth
                                            className="rounded-xl"
                                            onClick={() => {
                                                setDeleteConfirm(false);
                                                setDeleteText("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            fullWidth
                                            disabled={deleteText !== "DELETE"}
                                            className="rounded-xl"
                                            onClick={handleDeleteAccount}
                                        >
                                            <Trash2 size={14} />
                                            Delete Forever
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </SectionCard>

                {/* ── Brand Footer ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center text-small text-muted-foreground"
                >
                    <Sparkles size={12} className="mx-auto mb-1" />
                    <p>
                        Premium Thrift Fashion &mdash; THRIFTX &middot; v1.0
                    </p>
                </motion.div>
            </div>
        </main>
    );
}

