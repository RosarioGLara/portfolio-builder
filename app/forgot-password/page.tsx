
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });

      if (result.error) {
        setError(
          result.error.message ??
            "We couldn't process your request. Please try again.",
        );
        return;
      }

      setSubmitted(true);
      setMessage(
        "If an account exists for that email, a password-reset link will be sent. Check your inbox.",
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4EC] px-5 py-12 text-[#142D4E]">
      <section className="w-full max-w-md rounded-2xl border border-[#E4DED1] bg-white p-7 shadow-sm sm:p-10">
        <Link
          href="/sign-in"
          className="text-sm font-bold tracking-wide text-[#142D4E] hover:text-[#C55C1B]"
        >
          ← PORTFOLIO BUILDER
        </Link>

        <div className="mt-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C55C1B]">
            Account recovery
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Forgot your password?
          </h1>

          <p className="mt-3 leading-6 text-slate-600">
            Enter the email address associated with your account, and
            we’ll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div
            role="status"
            className="mt-7 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
          >
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
                className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#D96B24] focus:ring-4 focus:ring-[#D96B24]/10"
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
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#C55C1B] hover:underline"
          >
            Return to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
