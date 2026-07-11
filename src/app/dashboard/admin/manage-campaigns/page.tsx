"use client";

import Link from "next/link";
import { useState } from "react";
import { FiTrash2, FiGrid, FiExternalLink } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { apiReq } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { CoverImage } from "@/components/Image";
import {
  Button,
  EmptyState,
  LoadingScreen,
  Modal,
  PageHeading,
  StatusChip,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/utils";

export default function ManageCampaigns() {
  const { data, loading, refetch } = useApi<Campaign[]>("/campaigns");
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState(false);
  const campaigns = data ?? [];

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    await apiReq(`/campaigns/${deleting.id}`, { method: "DELETE" });
    setBusy(false);
    setDeleting(null);
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Manage campaigns"
        subtitle="Every campaign on the platform. Delete removes it and refunds backers."
      />

      {loading ? (
        <LoadingScreen label="Loading campaigns…" />
      ) : campaigns.length === 0 ? (
        <EmptyState icon={<FiGrid />} title="No campaigns yet" />
      ) : (
        <TableCard minWidth={760}>
          <thead>
            <tr className="border-b border-border">
              <TH>Campaign</TH>
              <TH>Creator</TH>
              <TH>Status</TH>
              <TH>Raised</TH>
              <TH>Deadline</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <TD>
                  <div className="flex items-center gap-3">
                    <CoverImage src={c.image} alt={c.title} className="h-10 w-14 shrink-0 rounded-lg" />
                    <span className="max-w-[14rem] truncate font-medium text-heading">
                      {c.title}
                    </span>
                  </div>
                </TD>
                <TD className="text-muted">{c.creatorName}</TD>
                <TD>
                  <StatusChip status={c.status} />
                </TD>
                <TD>
                  {formatCredits(c.raised)}/{formatCredits(c.fundingGoal)}
                </TD>
                <TD className="text-muted">{formatDate(c.deadline)}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/campaigns/${c.id}`} target="_blank">
                      <Button size="sm" variant="ghost">
                        <FiExternalLink /> View
                      </Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => setDeleting(c)}>
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete campaign"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} loading={busy}>
              Delete campaign
            </Button>
          </>
        }
      >
        <p className="text-sm text-body">
          Delete{" "}
          <span className="font-semibold text-heading">{deleting?.title}</span>?
          Approved backers will be refunded their credits automatically.
        </p>
      </Modal>
    </div>
  );
}
