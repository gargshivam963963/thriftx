
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  ErrorMessage,
  FormField,
  Input,
  PasswordField,
} from "@/components/ui/form";
import { useAuth } from "@/lib/AuthContext";
import { authClient } from "@/lib/auth-client";
import { getFriendlyError } from "@/lib/errors";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/\d/, "Must include a number"),
  terms: z.boolean().refine(
    (value) => value,
    "Please accept the terms and conditions",
  ),
});

type SignupValues = z.infer<typeof signupSchema>;

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { label: "Weak", bg: "bg-error" };
  }

  if (score <= 4) {
    return { label: "Medium", bg: "bg-warning" };
  }

  return { label: "Strong", bg: "bg-success" };
}

function PasswordStrengthBar({
  password,
}: {
  password: string;
}) {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  const labelColor =
    strength.label === "Weak"
      ? "text-error"
      : strength.label === "Medium"
        ? "text-warning"
        : "text-success";

  const requirements = [
    {
      met: password.length >= 8,
      label: "8+ characters",
    },
    {
      met: /[a-z]/.test(password),
      label: "Lowercase",
    },
    {
      met: /[A-Z]/.test(password),
      label: "Uppercase",
    },
    {
      met: /\d/.test(password),
      label: "One number",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-2"
    >
      <div
        className="flex h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`Password strength: ${strength.label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(
          Math.round((password.length / 12) * 100),
          100,
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min((password.length / 12) * 100, 100)}%`,
          }}
          transition={{ duration: 0.3 }}
          className={`rounded-full ${strength.bg}`}
        />
      </div>

      <span
        className={`text-badge font-semibold uppercase tracking-wider ${labelColor}`}
      >
        {strength.label}
      </span>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {requirements.map((requirement) => (
          <span
            key={requirement.label}
            className={`flex items-center gap-1.5 text-small ${requirement.met
                ? "text-success"
                : "text-muted-foreground"
              }`}
          >
            {requirement.met ? (
              <Check size={10} aria-hidden="true" />
            ) : (
              <X size={10} aria-hidden="true" />
            )}

            {requirement.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Signup() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    refreshUser,
  } = useAuth();

  const [verificationNotice, setVerificationNotice] =
    useState("");

  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const password = useWatch({
    control,
    name: "password",
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const onSubmit = async (values: SignupValues) => {
    setVerificationNotice("");
    clearErrors("root");

    try {
      const response = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      });

      if (response.error) {
        throw response.error;
      }

      if (!response.data?.token) {
        setVerificationNotice(
          "Your account request was accepted. If email verification is required, check your inbox for the verification link before signing in.",
        );

        return;
      }

      await refreshUser();
      router.replace("/");
    } catch (error) {
      const message = getFriendlyError(
        error,
        "Unable to create your account. Please try again.",
      );

      if (message.toLowerCase().includes("already")) {
        setError("email", {
          type: "manual",
          message:
            "An account with this email already exists. Please sign in instead.",
        });
      } else {
        setError("root", {
          type: "manual",
          message,
        });
      }
    }
  };

  const handleGoogleSignup = async () => {
    if (googleLoading || isSubmitting) return;

    clearErrors("root");
    setGoogleLoading(true);

    try {
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      setGoogleLoading(false);

      setError("root", {
        type: "manual",
        message: getFriendlyError(
          error,
          "Unable to continue with Google.",
        ),
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
          <Loader2
            className="h-10 w-10 animate-spin text-muted-foreground"
            aria-hidden="true"
          />

          <p className="text-body-sm text-muted-foreground">
            Setting up your experience...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-20 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-muted blur-[120px] sm:h-[420px] sm:w-[420px] dark:bg-card" />

        <div className="absolute bottom-0 right-0 h-[200px] w-[200px] rounded-full bg-muted blur-[120px] sm:h-[300px] sm:w-[300px] dark:bg-card/50" />
      </div>

      <main className="container-tight mx-auto flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-lg"
          aria-labelledby="signup-title"
        >
          <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-modal backdrop-blur-xl sm:p-8 md:p-10 dark:bg-card/90">
            <div className="mb-6 text-center sm:mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg sm:h-16 sm:w-16"
              >
                <UserPlus
                  size={24}
                  className="sm:h-[28px] sm:w-[28px]"
                  aria-hidden="true"
                />
              </motion.div>

              <h1
                id="signup-title"
                className="text-heading-2 text-foreground"
              >
                Join ThriftX
              </h1>

              <p className="mt-2 text-subtitle text-muted-foreground">
                Create your account to discover premium thrift fashion.
              </p>
            </div>

            <AnimatePresence initial={false}>
              {errors.root?.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-xl border border-error/30 bg-error-bg p-4 text-body-sm text-error-foreground"
                >
                  <X
                    size={16}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />

                  <span>{errors.root.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {verificationNotice && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-success/30 bg-success/10 p-4 text-body-sm text-success"
              >
                {verificationNotice}
              </div>
            )}

            <Button
              type="button"
              disabled={isSubmitting || googleLoading}
              loading={googleLoading}
              loadingText="Connecting..."
              onClick={handleGoogleSignup}
              variant="outline"
              size="lg"
              fullWidth
              className="mb-5 sm:mb-6"
            >
              {!googleLoading && (
                <>
                  <svg
                    width="20"
                    height="20"
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

                  Continue with Google
                </>
              )}
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

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5 sm:space-y-6"
            >
              <FormField
                label="Full Name"
                htmlFor="name"
                error={errors.name?.message}
                required
              >
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  error={!!errors.name}
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </FormField>

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
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </FormField>

              <FormField
                label="Password"
                htmlFor="password"
                error={errors.password?.message}
                required
              >
                <PasswordField
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  error={!!errors.password}
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />

                <PasswordStrengthBar password={password || ""} />
              </FormField>

              <FormField
                error={errors.terms?.message}
              >
                <label
                  htmlFor="terms"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id="terms"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-foreground"
                    aria-invalid={!!errors.terms}
                    {...register("terms")}
                  />

                  <span className="text-small leading-5 text-muted-foreground">
                    I agree to the{" "}
                    <Link
                      href="#"
                      className="font-semibold text-foreground underline underline-offset-4"
                    >
                      Terms
                    </Link>{" "}
                    &amp;{" "}
                    <Link
                      href="#"
                      className="font-semibold text-foreground underline underline-offset-4"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <ErrorMessage message={errors.terms?.message} />
              </FormField>

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isSubmitting}
                loadingText="Creating Account..."
                disabled={googleLoading}
                rightIcon={
                  !isSubmitting ? (
                    <ArrowRight size={17} aria-hidden="true" />
                  ) : undefined
                }
              >
                Create Account
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4 sm:my-8">
              <div className="h-px flex-1 bg-border" />

              <span className="text-caption text-muted-foreground">
                THRIFTX
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <p className="text-center text-body-sm text-muted-foreground">
                Already have an account?
              </p>

              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-border text-body-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}