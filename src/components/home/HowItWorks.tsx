import { FiUserPlus, FiSearch, FiHeart, FiCheckCircle } from "react-icons/fi";

const steps = [
  {
    icon: FiUserPlus,
    title: "Create your account",
    body: "Sign up as a Supporter or a Creator. New supporters start with 50 credits, creators with 20 — on the house.",
  },
  {
    icon: FiSearch,
    title: "Discover real projects",
    body: "Browse campaigns by category. Every one is admin-reviewed before it appears, so you always know it's legitimate.",
  },
  {
    icon: FiHeart,
    title: "Pledge with credits",
    body: "Back the ideas you believe in. Your pledge is held until the creator confirms it — declined pledges are refunded.",
  },
  {
    icon: FiCheckCircle,
    title: "Watch it come to life",
    body: "Creators post progress, withdraw what they raise, and you get notified every step. Impact you can actually follow.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            From idea to impact in four steps
          </h2>
          <p className="mt-3 text-muted">
            A credit-based model keeps funding simple, transparent, and fair for
            both sides of every campaign.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border bg-bg p-6"
            >
              <span className="absolute right-5 top-5 text-5xl font-black text-accent/10">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-xl text-accent">
                <s.icon />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-heading">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
