"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiFolder, FiPlusCircle } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { apiReq } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { CoverImage } from "@/components/Image";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  LoadingScreen,
  Modal,
  PageHeading,
  ProgressBar,
  StatusChip,
  TableCard,
  TextArea,
  TextInput,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits, formatDate, percent } from "@/lib/utils";

export default function MyCampaigns() {
  const { dbUser } = useAuth();
  const email = dbUser?.email ?? "";
  const { data, loading, refetch } = useApi<Campaign[]>(
    email ? `/campaigns/mine?email=${encodeURIComponent(email)}` : null,
  );

  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const [banner, setBanner] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("created")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBanner("Campaign submitted! It's now pending admin approval.");
      window.history.replaceState({}, "", "/dashboard/creator/my-campaigns");
    }
  }, []);

  const campaigns = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeading
        title="My campaigns"
        subtitle="Manage the campaigns you've created, sorted by deadline."
        action={
          <Link href="/dashboard/creator/add-campaign">
            <Button>
              <FiPlusCircle /> New campaign
            </Button>
          </Link>
        }
      />

      {banner && <Alert tone="success">{banner}</Alert>}

      {loading ? (
        <LoadingScreen label="Loading your campaigns…" />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<FiFolder />}
          title="No campaigns yet"
          message="Launch your first campaign and start raising credits from the community."
          action={
            <Link href="/dashboard/creator/add-campaign" className="mt-2">
              <Button variant="soft">Create a campaign</Button>
            </Link>
          }
        />
      ) : (
        <TableCard minWidth={720}>
          <thead>
            <tr className="border-b border-border">
              <TH>Campaign</TH>
              <TH>Status</TH>
              <TH>Raised</TH>
              <TH>Deadline</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <TD>
                  <div className="flex items-center gap-3">
                    <CoverImage
                      src={c.image}
                      alt={c.title}
                      className="h-11 w-16 shrink-0 rounded-lg"
                    />
                    <Link
                      href={`/campaigns/${c.id}`}
                      className="max-w-[16rem] truncate font-medium text-heading hover:text-accent"
                    >
                      {c.title}
                    </Link>
                  </div>
                </TD>
                <TD>
                  <StatusChip status={c.status} />
                </TD>
                <TD className="min-w-[9rem]">
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <ProgressBar value={percent(c.raised, c.fundingGoal)} />
                    </div>
                    <span className="text-xs text-muted">
                      {formatCredits(c.raised)}/{formatCredits(c.fundingGoal)}
                    </span>
                  </div>
                </TD>
                <TD className="text-muted">{formatDate(c.deadline)}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                      <FiEdit2 /> Edit
                    </Button>
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

      {editing && (
        <EditCampaignModal
          key={editing.id}
          campaign={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refetch();
          }}
        />
      )}
      <DeleteCampaignModal
        campaign={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null);
          refetch();
        }}
      />
    </div>
  );
}

function EditCampaignModal({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: Campaign;
  onClose: () => void;
  onSaved: () => void;
}) {
  // Mounted with key={campaign.id}, so initializing from props is safe.
  const [title, setTitle] = useState(campaign.title);
  const [story, setStory] = useState(campaign.story);
  const [rewardInfo, setRewardInfo] = useState(campaign.rewardInfo);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await apiReq(`/campaigns/${campaign.id}`, {
      method: "PATCH",
      body: { title, story, rewardInfo },
    });
    setLoading(false);
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit campaign"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={loading}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Story">
          <TextArea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="min-h-32"
          />
        </Field>
        <Field label="Reward info">
          <TextArea value={rewardInfo} onChange={(e) => setRewardInfo(e.target.value)} />
        </Field>
        <p className="text-xs text-muted">
          Only the title, story, and rewards can be edited after creation.
        </p>
      </div>
    </Modal>
  );
}

function DeleteCampaignModal({
  campaign,
  onClose,
  onDeleted,
}: {
  campaign: Campaign | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!campaign) return;
    setLoading(true);
    await apiReq(`/campaigns/${campaign.id}`, { method: "DELETE" });
    setLoading(false);
    onDeleted();
  }

  return (
    <Modal
      open={!!campaign}
      onClose={onClose}
      title="Delete campaign"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Keep it
          </Button>
          <Button variant="danger" onClick={remove} loading={loading}>
            Delete campaign
          </Button>
        </>
      }
    >
      <p className="text-sm text-body">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-heading">{campaign?.title}</span>? This
        can&apos;t be undone. All approved supporters will be automatically refunded
        their credits.
      </p>
    </Modal>
  );
}
