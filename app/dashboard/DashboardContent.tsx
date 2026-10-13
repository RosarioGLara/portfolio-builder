"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Portfolio = {
  id: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  config: unknown;
};

function getPortfolioTitle(config: unknown): string {
  if (!config || typeof config !== "object") {
    return "Untitled portfolio";
  }

  const profile = (config as { profile?: unknown }).profile;

  if (!profile || typeof profile !== "object") {
    return "Untitled portfolio";
  }

  const data = profile as Record<string, unknown>;

  for (const key of ["name", "fullName", "title"]) {
    if (typeof data[key] === "string" && data[key].trim()) {
      return data[key].trim();
    }
  }

  return "Untitled portfolio";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function DashboardContent() {
  const router = useRouter();

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState("");
  const [publishMessage, setPublishMessage] = useState("");

  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [copyError, setCopyError] = useState("");

  // Build the public URL using the current website's origin.
  function getPublicUrl(slug: string) {
    return `${window.location.origin}/p/${encodeURIComponent(slug)}`;
  }

  // Load the signed-in user's portfolios.
  const loadPortfolios = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/portfolios", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load your portfolios."
        );
      }

      setPortfolios(data.portfolios ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong loading your portfolios."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Publish or unpublish a portfolio.
  async function handlePublishToggle(portfolio: Portfolio) {
    const nextPublishedState = !portfolio.isPublished;

    setPublishingId(portfolio.id);
    setPublishError("");
    setPublishMessage("");
    setCopyError("");
    setCopyMessage("");
    setDeleteError("");

    try {
      const response = await fetch("/api/portfolios", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: portfolio.id,
          isPublished: nextPublishedState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update publishing status."
        );
      }

      setPortfolios((current) =>
        current.map((item) =>
          item.id === portfolio.id
            ? {
                ...item,
                isPublished: data.portfolio.isPublished,
                updatedAt: data.portfolio.updatedAt,
              }
            : item
        )
      );

      if (nextPublishedState) {
        setPublishMessage(
          `Portfolio "${getPortfolioTitle(portfolio.config)}" published successfully!`
        );
      } else {
        setPublishMessage(
          "Portfolio unpublished successfully. Its public page is no longer available."
        );
      }
    } catch (err) {
      setPublishError(
        err instanceof Error
          ? err.message
          : "Something went wrong updating your portfolio."
      );
    } finally {
      setPublishingId(null);
    }
  }

  // Copy the public link of a published portfolio.
  async function handleCopyLink(portfolio: Portfolio) {
    if (!portfolio.isPublished) {
      setCopyError("Publish this portfolio before copying its public link.");
      return;
    }

    setCopyingId(portfolio.id);
    setCopyError("");
    setCopyMessage("");
    setPublishError("");

    try {
      const publicUrl = getPublicUrl(portfolio.slug);

      if (!navigator.clipboard?.writeText) {
        throw new Error(
          "Clipboard access is unavailable. Open this website using HTTPS or copy the portfolio URL from your browser."
        );
      }

      await navigator.clipboard.writeText(publicUrl);

      setCopyMessage(
        `Public link copied: ${publicUrl}`
      );
    } catch (err) {
      setCopyError(
        err instanceof Error
          ? err.message
          : "Unable to copy the public link. Please copy the URL manually."
      );
    } finally {
      setCopyingId(null);
    }
  }

  // Permanently delete a portfolio.
  async function handleDelete(portfolio: Portfolio) {
    const title = getPortfolioTitle(portfolio.config);

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(portfolio.id);
    setDeleteError("");
    setPublishError("");
    setPublishMessage("");
    setCopyError("");
    setCopyMessage("");

    try {
      const response = await fetch("/api/portfolios", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: portfolio.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not delete portfolio."
        );
      }

      setPortfolios((current) =>
        current.filter((item) => item.id !== portfolio.id)
      );
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Something went wrong deleting the portfolio."
      );
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void loadPortfolios();
  }, [loadPortfolios]);

  return (
    <main className="min-h-screen bg-[#F7F4EC] px-4 py-8 text-[#142D4E] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard header */}
        <header className="relative mb-10 overflow-hidden rounded-2xl bg-[#102B4E] px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10"
          />

          <div className="relative">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E87524] font-black">
                PB
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide">
                  PORTFOLIO BUILDER
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Your work. Your story.
                </p>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F39A52]">
              Your workspace
            </p>

            <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              My Portfolios
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Keep your projects, experience, and professional story
              organized in one place.
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#E87524]" />
        </header>

        <section>
          {/* Publishing success message */}
          {publishMessage && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <p>{publishMessage}</p>
            </div>
          )}

          {/* Copy success message */}
          {copyMessage && (
            <div
              role="status"
              className="mb-4 break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <p>{copyMessage}</p>
            </div>
          )}

          {/* Publishing error */}
          {publishError && (
            <p
              role="alert"
              className="mb-4 text-sm text-red-700"
            >
              {publishError}
            </p>
          )}

          {/* Copy error */}
          {copyError && (
            <p
              role="alert"
              className="mb-4 break-words text-sm text-red-700"
            >
              {copyError}
            </p>
          )}

          {/* Deletion error */}
          {deleteError && (
            <p
              role="alert"
              className="mb-4 text-sm text-red-700"
            >
              {deleteError}
            </p>
          )}

          {/* Portfolio library heading */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Your portfolio library
              </h2>

              <p className="mt-1 text-sm text-[#5D6B7C]">
                {portfolios.length}{" "}
                {portfolios.length === 1
                  ? "portfolio"
                  : "portfolios"}{" "}
                saved to your account
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/editor?new=1")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#D96B24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#BC5519] focus:outline-none focus:ring-4 focus:ring-[#D96B24]/20"
            >
              <span aria-hidden="true">+</span>
              Create new portfolio
            </button>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="rounded-2xl border border-[#E4DED1] bg-white p-10 text-center">
              <p className="text-sm text-[#5D6B7C]">
                Loading your portfolios...
              </p>
            </div>
          ) : error ? (
            /* Loading error state */
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-white p-6"
            >
              <p className="font-semibold text-red-700">
                We couldn't load your portfolios.
              </p>

              <p className="mt-2 text-sm text-[#5D6B7C]">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadPortfolios()}
                className="mt-4 rounded-xl border border-[#DED8CB] px-4 py-2 text-sm font-semibold transition hover:bg-[#FFF1E6]"
              >
                Try again
              </button>
            </div>
          ) : portfolios.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border border-dashed border-[#D7CEBD] bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1E6] text-2xl text-[#A94310]">
                ✦
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Your story starts here
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5D6B7C]">
                Create your first portfolio to showcase your
                projects, skills, and experience.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/editor?new=1")
                }
                className="mt-6 rounded-xl bg-[#D96B24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#BC5519]"
              >
                Create my first portfolio
              </button>
            </div>
          ) : (
            /* Portfolio cards */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((portfolio) => (
                <article
                  key={portfolio.id}
                  className="overflow-hidden rounded-2xl border border-[#E4DED1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Card header */}
                  <div className="flex h-36 flex-col justify-between bg-[#102B4E] p-5 text-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold tracking-[0.16em] text-[#F39A52]">
                        PORTFOLIO
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          portfolio.isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-white/10 text-slate-200"
                        }`}
                      >
                        {portfolio.isPublished
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 font-serif text-xl font-bold">
                      {getPortfolioTitle(portfolio.config)}
                    </h3>
                  </div>

                  {/* Card details and actions */}
                  <div className="p-5">
                    <p className="truncate text-sm text-[#5D6B7C]">
                      /p/{portfolio.slug}
                    </p>

                    <p className="mt-2 text-xs text-[#7B8794]">
                      Last updated {formatDate(portfolio.updatedAt)}
                    </p>

                    {/* Open editor */}
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/editor?id=${encodeURIComponent(
                            portfolio.id
                          )}`
                        )
                      }
                      className="mt-5 w-full rounded-xl border border-[#D96B24] bg-[#FFF1E6] px-4 py-3 text-sm font-semibold text-[#A94310] transition hover:bg-[#FFE4D0]"
                    >
                      Continue editing →
                    </button>

                    {/* Publish or unpublish */}
                    <button
                      type="button"
                      disabled={
                        publishingId === portfolio.id ||
                        deletingId === portfolio.id
                      }
                      onClick={() =>
                        void handlePublishToggle(portfolio)
                      }
                      className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        portfolio.isPublished
                          ? "border border-[#D7CEBD] bg-white text-[#142D4E] hover:bg-[#F7F4EC]"
                          : "bg-[#102B4E] text-white hover:bg-[#1B426F]"
                      }`}
                    >
                      {publishingId === portfolio.id
                        ? "Updating..."
                        : portfolio.isPublished
                          ? "Unpublish portfolio"
                          : "Publish portfolio"}
                    </button>

                    {/* Copy link for published portfolios */}
                    {portfolio.isPublished && (
                      <button
                        type="button"
                        disabled={
                          copyingId === portfolio.id ||
                          publishingId === portfolio.id ||
                          deletingId === portfolio.id
                        }
                        onClick={() =>
                          void handleCopyLink(portfolio)
                        }
                        className="mt-2 w-full rounded-xl bg-[#E87524] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#BC5519] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copyingId === portfolio.id
                          ? "Copying link..."
                          : "Copy public link"}
                      </button>
                    )}

                    {/* Delete portfolio */}
                    <button
                      type="button"
                      disabled={
                        deletingId === portfolio.id ||
                        publishingId === portfolio.id ||
                        copyingId === portfolio.id
                      }
                      onClick={() =>
                        void handleDelete(portfolio)
                      }
                      className="mt-2 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === portfolio.id
                        ? "Deleting..."
                        : "Delete portfolio"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#E4DED1] pt-5 text-center text-xs tracking-wide text-[#7B8794]">
          SHPE · MAES · MINERS
        </footer>
      </div>
    </main>
  );
}
