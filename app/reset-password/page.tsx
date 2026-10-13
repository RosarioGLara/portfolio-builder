
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F7F4EC] px-5 text-[#142D4E]">
          <p className="text-sm text-slate-600">
            Loading password reset...
          </p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError(
        "This reset link is missing its token. Please request a new password-reset email.",
      );
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Your password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(
          result.error.message ??
            "We couldn't reset your password. The link may have expired.",
        );
        return;
      }

      setMessage("Your password has been reset successfully.");

      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch {
      setError("Something went wrong. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4EC] px-5 py-12 text-[#142D4E]">
      <section className="w-full max-w-md rounded-2xl border border-[#E4DED1] bg-white p-7 shadow-sm sm:p-10">
        <Link
          href="/sign-in"
          className="text-sm font-bold tracking-wide hover:text-[#C55C1B]"
        >
          ← PORTFOLIO BUILDER
        </Link>

        <div className="mt-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C55C1B]">
            Account recovery
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Reset your password.
          </h1>

          <p className="mt-3 leading-6 text-slate-600">
            Choose a new password for your Portfolio Builder account.
          </p>
        </div>

        {message ? (
          <div
            role="status"
            className="mt-7 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
          >
            {message}
            <p className="mt-2">Redirecting you to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold">
                New password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your new password"
                minLength={8}
                maxLength={128}
                required
                className="w-full rounded-xl border border-[#DED8CB] px-4 py-3.5 text-sm outline-none focus:border-[#D96B24] focus:ring-4 focus:ring-[#D96B24]/10"
              />
              <p className="text-xs text-slate-500">8–128 characters</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold"
              >
                Confirm new password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your new password again"
                minLength={8}
                maxLength={128}
                required
                className="w-full rounded-xl border border-[#DED8CB] px-4 py-3.5 text-sm outline-none focus:border-[#D96B24] focus:ring-4 focus:ring-[#D96B24]/10"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#D96B24] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#BC5519] focus:outline-none focus:ring-4 focus:ring-[#D96B24]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
