"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PaymentHistory } from "@/components/PaymentHistory";
import { PageHeading } from "@/components/ui";

export default function SupporterPaymentHistory() {
  const { dbUser } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeading
        title="Payment history"
        subtitle="A record of every credit purchase on your account."
      />
      <PaymentHistory email={dbUser?.email ?? ""} />
    </div>
  );
}
