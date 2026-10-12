
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [email, setEmail] = useState("");
    const router = useRouter();
    useEffect(() => {
        const savedEmail = sessionStorage.getItem("portfolioEmail");

        if (savedEmail) {
        setEmail(savedEmail);
        }
    }, []);
    return (
        <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900">
            {email ? `Welcome, ${email}` : "My Portfolio"}
            </h1>

            <p className="mt-2 text-gray-600">
            Create your personal website and showcase your work.
            </p>

            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
                Your portfolio
            </h2>

            <p className="mt-2 text-gray-600">
                Your portfolio draft will appear here.
            </p>

            <button
                onClick={() => router.push("/dashboard/editor")}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
                Create my portfolio
            </button>
            </div>
        </div>
        </main>
    );
}
