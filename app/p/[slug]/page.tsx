import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PortfolioPageProps = {
  params: Promise<{ slug: string }>;
};

type PortfolioItem = {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  showImage?: boolean;
  showLink?: boolean;
  linkLabel?: string;
  featured?: boolean;
};

type PortfolioSection = {
  id?: string;
  type?: string;
  title?: string;
  icon?: string;
  visible?: boolean;
  text?: string;
  tags?: string;
  items?: PortfolioItem[];
};

type PortfolioConfig = {
  profile?: {
    name?: string;
    headline?: string;
    eyebrow?: string;
    location?: string;
    badge?: string;
    email?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    cta2Label?: string;
    cta2Url?: string;
    footer?: string;
  };
  design?: {
    customAccent?: string;
    customBackground?: string;
    customText?: string;
    backdrop?: string;
    radius?: number;
    baseSize?: number;
    align?: string;
  };
  image?: {
    show?: boolean;
    src?: string;
    shape?: string;
    size?: number;
  };
  sections?: PortfolioSection[];
};

function safeHref(value?: string) {
  if (!value) return undefined;

  const trimmed = value.trim();

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}

export default function PortfolioPage({
  params,
}: PortfolioPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white px-6">
          <p className="text-sm text-slate-600">
            Loading portfolio...
          </p>
        </main>
      }
    >
      <PortfolioContent params={params} />
    </Suspense>
  );
}

async function PortfolioContent({
  params,
}: PortfolioPageProps) {
  const { slug } = await params;

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: {
      slug: true,
      config: true,
    },
  });

  // Drafts and nonexistent portfolios are not publicly accessible.
  if (!portfolio) {
    notFound();
  }

  const config = portfolio.config as unknown as PortfolioConfig;
  const profile = config.profile ?? {};
  const design = config.design ?? {};
  const image = config.image ?? {};

  const accent = design.customAccent || "#2563eb";
  const background = design.customBackground || "#ffffff";
  const foreground = design.customText || "#172033";

  const sections = (config.sections ?? []).filter(
    (section) => section.visible !== false
  );

  return (
    <main
      className="min-h-screen px-5 py-12 sm:px-8"
      style={{
        background,
        color: foreground,
        fontSize: design.baseSize ?? 16,
        backgroundImage:
          design.backdrop === "gradient"
            ? `linear-gradient(160deg, ${background}, #eaf0f8)`
            : undefined,
      }}
    >
      <article className="mx-auto max-w-4xl">
        <header
          className="border-b pb-10"
          style={{ borderColor: `${accent}40` }}
        >
          {profile.eyebrow && (
            <p
              className="mb-3 text-sm font-semibold uppercase tracking-widest"
              style={{ color: accent }}
            >
              {profile.eyebrow}
            </p>
          )}

          <div
            className={`flex flex-col gap-6 sm:flex-row ${
              design.align === "center"
                ? "items-center text-center"
                : "items-start text-left"
            }`}
          >
            {image.show && image.src && (
              <img
                src={image.src}
                alt={
                  profile.name
                    ? `${profile.name}'s profile`
                    : "Profile"
                }
                className="shrink-0 object-cover"
                style={{
                  width: image.size ?? 120,
                  height: image.size ?? 120,
                  borderRadius:
                    image.shape === "circle"
                      ? "50%"
                      : image.shape === "square"
                        ? 0
                        : 16,
                }}
              />
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {profile.name || "Portfolio"}
              </h1>

              {profile.headline && (
                <p className="mt-3 text-xl" style={{ color: accent }}>
                  {profile.headline}
                </p>
              )}

              {profile.location && (
                <p className="mt-2 opacity-70">
                  {profile.location}
                </p>
              )}

              {profile.badge && (
                <span
                  className="mt-4 inline-block rounded-full px-3 py-1 text-sm"
                  style={{
                    backgroundColor: `${accent}18`,
                    color: accent,
                  }}
                >
                  {profile.badge}
                </span>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {profile.ctaLabel && safeHref(profile.ctaUrl) && (
                  <a
                    href={safeHref(profile.ctaUrl)}
                    className="rounded-lg px-4 py-2 font-semibold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {profile.ctaLabel}
                  </a>
                )}

                {profile.cta2Label && safeHref(profile.cta2Url) && (
                  <a
                    href={safeHref(profile.cta2Url)}
                    className="rounded-lg border px-4 py-2 font-semibold"
                    style={{ borderColor: accent, color: accent }}
                  >
                    {profile.cta2Label}
                  </a>
                )}

                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="rounded-lg border px-4 py-2"
                    style={{ borderColor: `${accent}60` }}
                  >
                    Contact me
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-12 py-10">
          {sections.map((section, index) => {
            const items = section.items ?? [];

            return (
              <section
                key={section.id ?? `${section.title}-${index}`}
                className="min-w-0"
              >
                <h2
                  className="mb-5 border-b pb-3 text-2xl font-bold"
                  style={{ borderColor: `${accent}40` }}
                >
                  {section.icon ? `${section.icon} ` : ""}
                  {section.title || "Section"}
                </h2>

                {section.type === "text" && section.text && (
                  <p className="whitespace-pre-wrap leading-8 opacity-90">
                    {section.text}
                  </p>
                )}

                {section.type === "tags" && section.tags && (
                  <div className="flex flex-wrap gap-2">
                    {section.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag, tagIndex) => (
                        <span
                          key={`${tag}-${tagIndex}`}
                          className="rounded-full px-3 py-1.5 text-sm"
                          style={{
                            backgroundColor: `${accent}15`,
                            color: accent,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}

                {(section.type === "cards" ||
                  section.type === "timeline" ||
                  section.type === "links" ||
                  section.type === "contact") && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {items.map((item, itemIndex) => (
                      <article
                        key={item.id ?? `${item.title}-${itemIndex}`}
                        className="min-w-0 rounded-xl border p-5"
                        style={{
                          borderColor: `${accent}35`,
                          borderRadius: design.radius ?? 12,
                        }}
                      >
                        {section.type === "cards" &&
                          item.showImage !== false &&
                          item.image && (
                            <img
                              src={item.image}
                              alt={
                                item.imageAlt ||
                                item.title ||
                                "Project"
                              }
                              className="mb-4 max-h-64 w-full rounded-lg object-cover"
                            />
                          )}

                        {item.title && (
                          <h3 className="text-lg font-semibold">
                            {item.title}
                          </h3>
                        )}

                        {item.subtitle && (
                          <p
                            className="mt-1 text-sm"
                            style={{ color: accent }}
                          >
                            {item.subtitle}
                          </p>
                        )}

                        {item.description && (
                          <p className="mt-3 whitespace-pre-wrap leading-7 opacity-85">
                            {item.description}
                          </p>
                        )}

                        {(section.type === "links" ||
                          section.type === "contact") &&
                          !item.description &&
                          safeHref(item.url) && (
                            <a
                              href={safeHref(item.url)}
                              className="mt-3 inline-block underline underline-offset-4"
                              style={{ color: accent }}
                            >
                              Open link
                            </a>
                          )}

                        {section.type !== "links" &&
                          section.type !== "contact" &&
                          item.showLink !== false &&
                          safeHref(item.url) && (
                            <a
                              href={safeHref(item.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-block font-semibold underline underline-offset-4"
                              style={{ color: accent }}
                            >
                              {item.linkLabel || "Learn more"}
                            </a>
                          )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <footer
          className="border-t py-6 text-center text-sm opacity-70"
          style={{ borderColor: `${accent}40` }}
        >
          {profile.footer ||
            `© ${new Date().getFullYear()} ${profile.name || "Portfolio"}`}
        </footer>
      </article>
    </main>
  );
}
