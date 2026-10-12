
import { Suspense } from "react";

type PortfolioPageProps = {
  params: Promise<{ slug: string }>;
};

export default function PortfolioPage({ params }: PortfolioPageProps) {
  return (
    <Suspense fallback={<p>Loading portfolio...</p>}>
      <PortfolioContent params={params} />
    </Suspense>
  );
}

async function PortfolioContent({ params }: PortfolioPageProps) {
  const { slug } = await params;

  const displayName = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <main style={{ maxWidth: "800px", margin: "80px auto", padding: "24px" }}>
      <h1>{displayName}</h1>
      <p>This is my public portfolio page.</p>
      <p>My portfolio URL: /p/{slug}</p>
    </main>
  );
}
