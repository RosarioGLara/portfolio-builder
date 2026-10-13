
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "register") {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          callbackURL: "/dashboard",
        });

        if (result.error) {
          setMessage(result.error.message ?? "Registration failed.");
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/dashboard",
        });

        if (result.error) {
          setMessage(result.error.message ?? "Sign-in failed.");
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isRegistering = mode === "register";

  return (
    <main className="min-h-screen bg-[#F7F4EC] text-[#142D4E]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: brand and welcome panel */}
        <section className="relative flex min-h-[340px] flex-col justify-between overflow-hidden bg-[#102B4E] px-7 py-8 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:px-16 lg:py-12">
          {/* Decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#E87524]/15 blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E87524] text-xl font-black text-white shadow-lg shadow-black/10">
                PB
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide">
                  PORTFOLIO BUILDER
                </p>
                <p className="mt-0.5 text-xs text-slate-300">
                  Your work. Your story.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl py-12 lg:py-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-orange-200">
              <span className="h-2 w-2 rounded-full bg-[#E87524]" />
              MADE FOR THE NEXT GENERATION
            </div>

            <h1 className="max-w-lg font-serif text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Your next
              <span className="block text-[#F39A52]">
                opportunity
              </span>
              starts here.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-300 sm:text-lg">
              Turn your projects, ideas, and experiences into a portfolio
              that shows the world what you can build.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="h-1 w-14 rounded-full bg-[#E87524]" />
              <p className="text-sm font-medium text-slate-200">
                Learn. Create. Lead.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6">
            <p className="text-xs text-slate-400">
              Inspired by the UTEP engineering community
            </p>
            <p className="text-xs font-bold tracking-widest text-orange-200">
              SHPE · MAES · MINERS
            </p>
          </div>
        </section>

        {/* Right: authentication form */}
        <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C55C1B]">
                Your professional journey
              </p>

              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#142D4E] sm:text-4xl">
                {isRegistering ? "Build your future." : "Welcome back."}
              </h2>

              <p className="mt-3 leading-6 text-slate-600">
                {isRegistering
                  ? "Create your account and start bringing your work together."
                  : "Sign in to continue building your portfolio."}
              </p>
            </div>

            {/* Authentication tabs */}
            <div
              className="mb-7 grid grid-cols-2 rounded-xl border border-[#E4DED1] bg-[#EEE9DE] p-1.5"
              aria-label="Authentication options"
            >
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
                disabled={loading}
                aria-pressed={isRegistering}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                  isRegistering
                    ? "bg-white text-[#142D4E] shadow-sm"
                    : "text-slate-600 hover:text-[#142D4E]"
                }`}
              >
                Create account
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                disabled={loading}
                aria-pressed={!isRegistering}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                  !isRegistering
                    ? "bg-white text-[#142D4E] shadow-sm"
                    : "text-slate-600 hover:text-[#142D4E]"
                }`}
              >
                Sign in
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name: registration only */}
              {isRegistering && (
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-[#243A53]"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3.5 text-sm text-[#142D4E] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#D96B24] focus:ring-4 focus:ring-[#D96B24]/10"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#243A53]"
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
                  className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3.5 text-sm text-[#142D4E] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#D96B24] focus:ring-4 focus:ring-[#D96B24]/10"
                />
              </div>

              {/* Password label and forgot-password link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#243A53]"
                  >
                    Password
                  </label>

                  {isRegistering ? (
                    <span className="text-xs text-slate-500">
                      8–128 characters
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      className="rounded-sm text-xs font-semibold text-[#C55C1B] transition hover:text-[#142D4E] hover:underline focus:outline-none focus:ring-2 focus:ring-[#D96B24]/40"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {/* Password input: shown in both modes */}
                <input
                  id="password"
                  type="password"
                  autoComplete={
                    isRegistering ? "new-password" : "current-password"
                  }
                  placeholder={
                    isRegistering
                      ? "Create a strong password"
                      : "Your password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3.5 text-sm text-[#142D4E] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#D96B24] focus:ring-4 focus:ring-[#D96B24]/10"
                />

                {isRegistering && (
                  <p className="text-xs leading-5 text-slate-500">
                    Choose a password you do not use on other websites.
                  </p>
                )}
              </div>

              {/* Error message */}
              {message && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#D96B24] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#D96B24]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#BC5519] hover:shadow-xl hover:shadow-[#D96B24]/25 focus:outline-none focus:ring-4 focus:ring-[#D96B24]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading
                  ? "Please wait..."
                  : isRegistering
                    ? "Create my account"
                    : "Sign in to my portfolio"}

                {!loading && (
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E4DED1]" />
              <span className="text-xs text-slate-400">
                BUILT FOR WHAT'S NEXT
              </span>
              <div className="h-px flex-1 bg-[#E4DED1]" />
            </div>

            <p className="text-center text-xs leading-5 text-slate-500">
              {isRegistering
                ? "Already have an account? Select Sign in above."
                : "New to Portfolio Builder? Select Create account above."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
