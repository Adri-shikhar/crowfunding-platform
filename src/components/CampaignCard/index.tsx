import Link from "next/link";
import { FiClock, FiUsers } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { CATEGORIES } from "@/data/seed";
import { CoverImage } from "@/components/Image";
import { ProgressBar } from "@/components/ui";
import { daysLeft, formatCredits, isExpired, percent } from "@/lib/utils";

function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function CampaignCard({
  campaign,
  href,
}: {
  campaign: Campaign;
  href?: string;
}) {
  const link = href ?? `/campaigns/${campaign.id}`;
  const pct = percent(campaign.raised, campaign.fundingGoal);
  const ended = isExpired(campaign.deadline);
  const left = daysLeft(campaign.deadline);

  return (
    <Link
      href={link}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CoverImage
          src={campaign.image}
          alt={campaign.title}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {categoryName(campaign.category)}
        </span>
        {ended && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
            Ended
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-heading transition-colors group-hover:text-accent">
          {campaign.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">
          {campaign.story}
        </p>

        <div className="mt-4">
          <ProgressBar value={pct} />
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-heading">
              {formatCredits(campaign.raised)}
              <span className="font-normal text-muted">
                {" "}
                / {formatCredits(campaign.fundingGoal)} cr
              </span>
            </span>
            <span className="font-semibold text-accent">{pct}%</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <FiUsers /> {formatCredits(campaign.backers)} backers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiClock /> {ended ? "Ended" : `${left} days left`}
          </span>
        </div>
      </div>
    </Link>
  );
}
