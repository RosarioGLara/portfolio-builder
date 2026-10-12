
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleContinue() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      alert("Please enter your email address.");
      return;
    }

    sessionStorage.setItem("portfolioEmail", trimmedEmail);
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Build your portfolio.
        </h1>

        <p className="mt-4 text-gray-600">
          Showcase your skills, projects, and experience with your own
          personal website.
        </p>

        <div className="mt-8">
          <label
            htmlFor="email"
            className="mb-2 block text-left text-sm font-medium text-gray-700"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleContinue();
              }
            }}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={handleContinue}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Continue with email
          </button>

          <p className="mt-4 text-sm text-gray-500">
            No password required.
          </p>
        </div>
      </div>
    </main>
  );
}
