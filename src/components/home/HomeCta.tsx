import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { buttonClasses } from "@/components/ui/styles";

export function HomeCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Ready to back a bright idea — or launch your own?
          </h2>
          <p className="mt-4 text-muted">
            Join FundSpring today. Supporters start with 50 credits, creators with
            20. No fees to sign up, and every campaign is reviewed for trust.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonClasses("accent", "lg")}>
              Create your account <FiArrowRight />
            </Link>
            <Link href="/explore-campaigns" className={buttonClasses("outline", "lg")}>
              Browse campaigns first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
