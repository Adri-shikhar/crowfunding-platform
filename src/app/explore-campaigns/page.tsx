import type { Metadata } from "next";
import { CampaignBrowser } from "@/components/CampaignBrowser";

export const metadata: Metadata = {
  title: "Explore Campaigns",
  description: "Browse reviewed crowdfunding campaigns and back the ideas you believe in.",
};

export default async function ExploreCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
          Explore campaigns
        </h1>
        <p className="mt-3 text-muted">
          Every campaign here has been reviewed and approved. Find a cause worth
          backing and turn your credits into real-world impact.
        </p>
      </header>

      <div className="mt-10">
        <CampaignBrowser initialCategory={category ?? ""} />
      </div>
    </div>
  );
}
