import Link from "next/link";
import { FaLinkedinIn, FaFacebookF, FaGithub } from "react-icons/fa6";
import { Logo } from "@/components/Logo";
import { LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const socials = [
  { label: "LinkedIn", href: LINKS.linkedin, icon: FaLinkedinIn },
  { label: "Facebook", href: LINKS.facebook, icon: FaFacebookF },
  { label: "GitHub", href: LINKS.github, icon: FaGithub },
];

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Browse Campaigns", href: "/explore-campaigns" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Categories", href: "/#categories" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Become a Supporter", href: "/signup" },
      { label: "Start a Campaign", href: "/signup" },
      { label: "Log In", href: "/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted">
              {SITE_TAGLINE}. A credit-based crowdfunding platform for reviewed,
              real-world projects — from solar classrooms to community markets.
            </p>
            <div className="mt-5 flex gap-2.5">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-body transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-heading">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold text-heading">Trust &amp; Safety</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
              <li>Every campaign is admin-reviewed</li>
              <li>Declined pledges are refunded</li>
              <li>Transparent credit accounting</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Built for a MERN
            assessment.
          </p>
          <p>Credits are a demo currency — no real money moves in the mock.</p>
        </div>
      </div>
    </footer>
  );
}
