"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PaymentHistory } from "@/components/PaymentHistory";
import { PageHeading } from "@/components/ui";

export default function CreatorPaymentHistory() {
  const { dbUser } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeading
        title="Payment history"
        subtitle="Every withdrawal payout you've received on FundSpring."
      />
      <PaymentHistory email={dbUser?.email ?? ""} />
    </div>
  );
}
