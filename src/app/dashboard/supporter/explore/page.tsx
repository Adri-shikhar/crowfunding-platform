"use client";

import { CampaignBrowser } from "@/components/CampaignBrowser";
import { PageHeading } from "@/components/ui";

export default function SupporterExplore() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="Explore campaigns"
        subtitle="Live, approved campaigns you can back right now. Pick one and pledge your credits."
      />
      <CampaignBrowser notExpiredOnly linkBase="/campaigns" />
    </div>
  );
}
