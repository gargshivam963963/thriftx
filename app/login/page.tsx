'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    ArrowRight,
    Loader2,
    Eye,
    EyeOff,
    Mail,
    Lock,
    ShieldCheck,
} from 'lucide-react';
import { account } from '@/lib/appwrite';
import { OAuthProvider } from 'appwrite';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        const savedEmail = localStorage.getItem('thriftx-email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRemember(true);
        }
    }, []);

    const validate = () => {
        if (!email.trim()) {
            setError('Email is required.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email.');
            return false;
        }
        if (!password.trim()) {
            setError('Password is required.');
            return false;
        }
        if (password.length < 8) {
            setError('Password should be at least 8 characters.');
            return false;
        }
        return true;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            await account.createEmailPasswordSession(email, password);
            if (remember) {
                localStorage.setItem('thriftx-email', email);
            } else {
                localStorage.removeItem('thriftx-email');
            }
            await refreshUser();
            router.replace('/');
        } catch (err: any) {
            setError(err?.message || 'Incorrect email or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            await account.createOAuth2Session(
                OAuthProvider.Google,
                `${window.location.origin}/`,
                `${window.location.origin}/login`
            );
        } catch (err: any) {
            setGoogleLoading(false);
            setError(err?.message || 'Unable to continue with Google.');
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Enter your email first.');
            return;
        }
        try {
            await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
            alert('Recovery email sent successfully.');
        } catch (err: any) {
            setError(err?.message || 'Unable to send recovery email.');
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
                    <Loader2 className="h-10 w-10 animate-spin text-neutral-400 dark:text-neutral-500" />
                    <p className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
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
                <div className="absolute left-1/2 top-20 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-neutral-200 blur-[120px] sm:h-[420px] sm:w-[420px] dark:bg-neutral-800" />
                <div className="absolute bottom-0 right-0 h-[200px] w-[200px] rounded-full bg-neutral-100 blur-[120px] sm:h-[300px] sm:w-[300px] dark:bg-neutral-800/50" />
            </div>

            <div className="mx-auto flex min-h-[90vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-5 sm:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="w-full max-w-lg"
                >
                    <div className="rounded-[28px] border border-neutral-200 bg-white/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,.08)] backdrop-blur-xl sm:rounded-[34px] sm:p-8 md:p-10 dark:border-neutral-700/50 dark:bg-neutral-900/90">
                        {/* Header */}
                        <div className="mb-6 text-center sm:mb-10">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg sm:h-16 sm:w-16 dark:bg-neutral-200 dark:text-neutral-900"
                            >
                                <ShieldCheck size={24} className="sm:size-[30px]" />
                            </motion.div>
                            <h1 className="font-serif text-3xl font-bold tracking-wide sm:text-4xl dark:text-neutral-100">
                                Welcome Back
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-neutral-500 sm:mt-3 sm:text-[15px] sm:leading-7 dark:text-neutral-400">
                                Continue your premium thrift shopping experience.
                            </p>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 sm:mb-6 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Google OAuth */}
                        <button
                            type="button"
                            disabled={googleLoading}
                            onClick={handleGoogleLogin}
                            className="mb-5 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-300 bg-white font-medium text-sm transition-all hover:border-black hover:bg-neutral-50 sm:mb-6 sm:h-14 sm:text-base dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-400 dark:hover:bg-neutral-700"
                        >
                            {googleLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 48 48" className="sm:h-[22px] sm:w-[22px]">
                                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.215 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.146 35.091 26.715 36 24 36c-5.194 0-9.623-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                                        <path fill="#1976D2" d="M43.611 20.083L43.595 20H24v8h11.303c-1.08 3.091-3.309 5.548-6.084 7.071l.003-.002 6.19 5.238C35.004 40.078 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        {/* OR Divider */}
                        <div className="relative mb-5 sm:mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-xs uppercase tracking-[4px] text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[3px] text-neutral-500 dark:text-neutral-400">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 sm:left-5" size={16} />
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                                        className="h-12 w-full rounded-2xl border border-neutral-300 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-900 outline-none transition-all duration-300 focus:border-black focus:bg-white sm:h-14 sm:pl-14 sm:pr-5 sm:text-base dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400 dark:focus:bg-neutral-800"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-[3px] text-neutral-500 dark:text-neutral-400">
                                        Password
                                    </label>
                                    <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold uppercase tracking-[2px] text-neutral-500 transition hover:text-black dark:text-neutral-400 dark:hover:text-neutral-200">
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 sm:left-5" size={16} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (error) setError('') }}
                                        className="h-12 w-full rounded-2xl border border-neutral-300 bg-neutral-50 pl-11 pr-11 text-sm text-neutral-900 outline-none transition-all duration-300 focus:border-black focus:bg-white sm:h-14 sm:pl-14 sm:pr-14 sm:text-base dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400 dark:focus:bg-neutral-800"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black sm:right-5 dark:hover:text-neutral-200">
                                        {showPassword ? <EyeOff size={17} className="sm:size-[19px]" /> : <Eye size={17} className="sm:size-[19px]" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me & Secure badge */}
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox" className="h-4 w-4 rounded border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800" />
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Remember me
                                    </span>
                                </label>
                                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-[2px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                    Secure Login
                                </span>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                type="submit"
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm text-white shadow-lg transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:gap-3 sm:text-base dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={17} className="sm:size-[19px]" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* THRIFTX Divider */}
                        <div className="my-6 flex items-center gap-4 sm:my-8">
                            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                            <span className="text-xs uppercase tracking-[4px] text-neutral-400 dark:text-neutral-500">
                                THRIFTX
                            </span>
                            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                        </div>

                        {/* Already have account */}
                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                                Don&apos;t have an account yet?
                            </p>
                            <Link
                                href="/signup"
                                className="flex h-12 w-full items-center justify-center rounded-2xl border border-neutral-800 text-sm font-medium text-neutral-900 transition-all hover:bg-neutral-900 hover:text-white sm:h-14 sm:text-base dark:border-neutral-400 dark:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
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

