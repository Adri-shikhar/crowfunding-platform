"use client";

import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { apiReq } from "@/lib/api";
import { Alert, Button, Modal, TextArea } from "@/components/ui";

export function ReportDialog({ campaign }: { campaign: Campaign }) {
  const { firebaseUser, dbUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!firebaseUser) return null;

  async function submit() {
    if (reason.trim().length < 10) {
      setError("Please describe the issue in a little more detail.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await apiReq("/reports", {
      method: "POST",
      body: {
        reporterEmail: dbUser?.email || firebaseUser?.email,
        reporterName: dbUser?.name || firebaseUser?.displayName,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        reason: reason.trim(),
      },
    });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setDone(true);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-rose-500"
      >
        <FiFlag /> Report this campaign
      </button>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setDone(false);
          setReason("");
          setError("");
        }}
        title="Report campaign"
        footer={
          done ? (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={submit} loading={loading}>
                Submit report
              </Button>
            </>
          )
        }
      >
        {done ? (
          <Alert tone="success">
            Thanks for flagging this. Our admins will review it shortly.
          </Alert>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Tell us what&apos;s wrong with{" "}
              <span className="font-medium text-heading">{campaign.title}</span>.
              Reports are reviewed by the FundSpring team.
            </p>
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue — misleading claims, wrong reward tiers, etc."
            />
            {error && <Alert tone="error">{error}</Alert>}
          </div>
        )}
      </Modal>
    </>
  );
}
