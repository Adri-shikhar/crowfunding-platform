/**
 * Seed data for the mock backend. Every string here is real, on-theme copy —
 * no placeholder Lorem ipsum. Deadlines are computed relative to "now" so the
 * demo always has live (not-expired) campaigns.
 *
 * TODO(server): delete this file once the Express API is live; the mock layer
 * in src/data/mockDb.ts is the only consumer.
 */

import type {
  AppNotification,
  AppUser,
  Campaign,
  Contribution,
  Payment,
  Report,
  Testimonial,
  Withdrawal,
} from "@/lib/types";

export interface SeedDb {
  users: AppUser[];
  campaigns: Campaign[];
  contributions: Contribution[];
  payments: Payment[];
  withdrawals: Withdrawal[];
  notifications: AppNotification[];
  reports: Report[];
}

export interface CategoryDef {
  slug: string;
  name: string;
  blurb: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "technology", name: "Technology", blurb: "Hardware, apps & open tools" },
  { slug: "environment", name: "Environment", blurb: "Climate, clean energy & nature" },
  { slug: "education", name: "Education", blurb: "Learning for every community" },
  { slug: "health", name: "Health", blurb: "Care, research & wellbeing" },
  { slug: "arts", name: "Arts & Culture", blurb: "Music, film & the makers" },
  { slug: "community", name: "Community", blurb: "Local projects that connect us" },
  { slug: "games", name: "Games", blurb: "Tabletop & indie studios" },
  { slug: "social-good", name: "Social Good", blurb: "Nonprofits & relief work" },
];

const cover = (seed: string) => `https://picsum.photos/seed/${seed}/1200/750`;
const face = (n: number) => `https://i.pravatar.cc/200?img=${n}`;

function iso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function buildSeed(): SeedDb {
  const users: AppUser[] = [
    {
      id: "u-admin",
      uid: "seed-admin",
      name: "Amara Osei",
      email: "admin@fundspring.io",
      photoURL: face(12),
      role: "admin",
      credits: 0,
      raisedCredits: 0,
      createdAt: iso(-120),
    },
    {
      id: "u-creator-1",
      uid: "seed-creator-1",
      name: "Noah Whitfield",
      email: "noah@fundspring.io",
      photoURL: face(15),
      role: "creator",
      credits: 20,
      raisedCredits: 1240,
      createdAt: iso(-90),
    },
    {
      id: "u-creator-2",
      uid: "seed-creator-2",
      name: "Priya Nair",
      email: "priya@fundspring.io",
      photoURL: face(45),
      role: "creator",
      credits: 20,
      raisedCredits: 860,
      createdAt: iso(-75),
    },
    {
      id: "u-creator-3",
      uid: "seed-creator-3",
      name: "Diego Marchetti",
      email: "diego@fundspring.io",
      photoURL: face(33),
      role: "creator",
      credits: 20,
      raisedCredits: 150,
      createdAt: iso(-40),
    },
    {
      id: "u-supporter-1",
      uid: "seed-supporter-1",
      name: "Lena Park",
      email: "lena@fundspring.io",
      photoURL: face(5),
      role: "supporter",
      credits: 320,
      raisedCredits: 0,
      createdAt: iso(-60),
    },
    {
      id: "u-supporter-2",
      uid: "seed-supporter-2",
      name: "Marcus Bell",
      email: "marcus@fundspring.io",
      photoURL: face(8),
      role: "supporter",
      credits: 145,
      raisedCredits: 0,
      createdAt: iso(-30),
    },
  ];

  const campaigns: Campaign[] = [
    {
      id: "c-solar-lantern",
      title: "SolarLeaf: Off-Grid Lanterns for Rural Classrooms",
      story:
        "Thousands of students study by candlelight after sunset. SolarLeaf is a rugged, palm-sized solar lantern that charges in a single afternoon and gives 12 hours of clean, flicker-free light. Your credits fund the first production run for five village schools and pay for the teacher training that goes with them.",
      category: "environment",
      fundingGoal: 2000,
      minContribution: 10,
      deadline: iso(26),
      rewardInfo:
        "50+ credits: your name engraved on the school donor wall. 200+ credits: a lantern shipped to you as a thank-you.",
      image: cover("solarleaf"),
      creatorEmail: "noah@fundspring.io",
      creatorName: "Noah Whitfield",
      status: "approved",
      raised: 1240,
      backers: 38,
      createdAt: iso(-30),
    },
    {
      id: "c-reef-lab",
      title: "OpenReef: A Community Coral Restoration Lab",
      story:
        "Coral nurseries work, but the equipment is locked behind expensive vendors. OpenReef publishes open-source hardware for growing heat-resilient coral fragments, plus a curriculum any coastal community can run. We are funding the first shared lab and the documentation that lets others copy it.",
      category: "environment",
      fundingGoal: 3000,
      minContribution: 15,
      deadline: iso(41),
      rewardInfo:
        "100+ credits: adopt a coral fragment and follow its growth. 500+ credits: a lab-tour livestream invite.",
      image: cover("openreef"),
      creatorEmail: "priya@fundspring.io",
      creatorName: "Priya Nair",
      status: "approved",
      raised: 860,
      backers: 21,
      createdAt: iso(-24),
    },
    {
      id: "c-braille-tablet",
      title: "TouchType: An Affordable Refreshable Braille Tablet",
      story:
        "Refreshable braille displays cost more than a laptop. TouchType uses a new low-cost actuator to bring a full line of braille under a hundred dollars. Funds go toward tooling for the actuator and a pilot with two schools for the blind.",
      category: "technology",
      fundingGoal: 5000,
      minContribution: 20,
      deadline: iso(18),
      rewardInfo:
        "Every backer gets early access to the companion reading app. 300+ credits: name in the launch credits.",
      image: cover("touchtype"),
      creatorEmail: "noah@fundspring.io",
      creatorName: "Noah Whitfield",
      status: "approved",
      raised: 3180,
      backers: 96,
      createdAt: iso(-45),
    },
    {
      id: "c-night-market",
      title: "The Riverside Night Market: A Home for 40 Local Makers",
      story:
        "Our city lost its weekend market to redevelopment. We are reopening it under the river bridge with weatherproof stalls, shared power, and a small-business mentoring booth. Your support covers the stalls and the first season's permits so 40 makers have somewhere to sell again.",
      category: "community",
      fundingGoal: 2500,
      minContribution: 10,
      deadline: iso(33),
      rewardInfo:
        "25+ credits: a market tote from a featured maker. 150+ credits: a tasting pass for opening weekend.",
      image: cover("nightmarket"),
      creatorEmail: "priya@fundspring.io",
      creatorName: "Priya Nair",
      status: "approved",
      raised: 1520,
      backers: 54,
      createdAt: iso(-20),
    },
    {
      id: "c-story-bikes",
      title: "Story Bikes: A Rolling Library for Kids Without One",
      story:
        "Two converted cargo bikes, three hundred books, and a route through the neighborhoods with no library branch. Story Bikes brings weekly read-alongs and free books to kids who otherwise go without. Credits fund the second bike and this year's book restocks.",
      category: "education",
      fundingGoal: 1800,
      minContribution: 10,
      deadline: iso(12),
      rewardInfo:
        "40+ credits: a postcard drawn by kids on the route. 250+ credits: sponsor a book crate with your dedication.",
      image: cover("storybikes"),
      creatorEmail: "diego@fundspring.io",
      creatorName: "Diego Marchetti",
      status: "approved",
      raised: 150,
      backers: 9,
      createdAt: iso(-8),
    },
    {
      id: "c-mycelium",
      title: "GrowBlocks: Home Kits for Mushroom-Grown Packaging",
      story:
        "Styrofoam lasts centuries; mushroom packaging composts in weeks. GrowBlocks is a countertop kit that lets makers grow their own protective packaging from agricultural waste. We are funding the mold library and a plain-language growing guide.",
      category: "technology",
      fundingGoal: 2200,
      minContribution: 15,
      deadline: iso(48),
      rewardInfo:
        "Every backer gets the digital growing guide. 200+ credits: a starter kit with two reusable molds.",
      image: cover("growblocks"),
      creatorEmail: "diego@fundspring.io",
      creatorName: "Diego Marchetti",
      status: "approved",
      raised: 640,
      backers: 27,
      createdAt: iso(-15),
    },
    {
      id: "c-choir",
      title: "The Midnight Choir: A Free Album for Night-Shift Workers",
      story:
        "Nurses, drivers, and bakers keep the city running while it sleeps. The Midnight Choir is a nine-track album written from their stories, recorded with a community ensemble and released free. Credits cover studio time and the musicians' fair pay.",
      category: "arts",
      fundingGoal: 1500,
      minContribution: 10,
      deadline: iso(37),
      rewardInfo:
        "30+ credits: lossless download before release. 180+ credits: your dedication read in the liner notes.",
      image: cover("midnightchoir"),
      creatorEmail: "priya@fundspring.io",
      creatorName: "Priya Nair",
      status: "approved",
      raised: 720,
      backers: 33,
      createdAt: iso(-18),
    },
    {
      id: "c-clinic-fridge",
      title: "ColdChain: Solar Vaccine Fridges for Remote Clinics",
      story:
        "A vaccine is only as good as the fridge that holds it. ColdChain pairs a high-efficiency medical fridge with a small solar array and a temperature logger that texts the clinic if anything drifts. Funds equip three clinics beyond the power grid.",
      category: "health",
      fundingGoal: 4000,
      minContribution: 20,
      deadline: iso(29),
      rewardInfo:
        "100+ credits: monthly impact reports from the clinics. 600+ credits: name a fridge after someone you love.",
      image: cover("coldchain"),
      creatorEmail: "noah@fundspring.io",
      creatorName: "Noah Whitfield",
      status: "approved",
      raised: 2260,
      backers: 71,
      createdAt: iso(-22),
    },
    {
      id: "c-tabletop",
      title: "Lanterns & Lore: A Cozy Tabletop RPG About Kindness",
      story:
        "No dungeons, no combat — just a warm, rules-light RPG where players rebuild a village one act of kindness at a time. We are funding the full-color rulebook, a deck of prompt cards, and pay for the illustrators.",
      category: "games",
      fundingGoal: 1600,
      minContribution: 10,
      deadline: iso(21),
      rewardInfo:
        "Every backer gets the print-and-play PDF. 220+ credits: the boxed edition with the prompt deck.",
      image: cover("lanternslore"),
      creatorEmail: "diego@fundspring.io",
      creatorName: "Diego Marchetti",
      status: "approved",
      raised: 980,
      backers: 44,
      createdAt: iso(-14),
    },
    {
      id: "c-water-pending",
      title: "RainKeeper: Rooftop Rainwater Kits for Dry-Season Farms",
      story:
        "Smallholder farms lose crops every dry season while monsoon rain runs off the roof unused. RainKeeper is a modular gutter-and-tank kit sized for a single household plot, with a simple filter for kitchen use. We are seeking approval to launch the pilot in twelve farms.",
      category: "environment",
      fundingGoal: 2800,
      minContribution: 15,
      deadline: iso(52),
      rewardInfo:
        "80+ credits: a harvest photo journal from a pilot farm. 400+ credits: fund a full kit and name the farm.",
      image: cover("rainkeeper"),
      creatorEmail: "priya@fundspring.io",
      creatorName: "Priya Nair",
      status: "pending",
      raised: 0,
      backers: 0,
      createdAt: iso(-2),
    },
    {
      id: "c-makerspace-pending",
      title: "The Repair Café: A Free Fix-It Workshop for the Neighborhood",
      story:
        "Half of what we throw away just needs one part or one hour. The Repair Café is a monthly drop-in where volunteer fixers mend clothes, toasters, bikes, and laptops for free. We are seeking approval to fund the tool wall and the first year of space rental.",
      category: "community",
      fundingGoal: 1400,
      minContribution: 10,
      deadline: iso(44),
      rewardInfo:
        "20+ credits: a printed repair-basics zine. 120+ credits: a reserved slot at every café for a year.",
      image: cover("repaircafe"),
      creatorEmail: "diego@fundspring.io",
      creatorName: "Diego Marchetti",
      status: "pending",
      raised: 0,
      backers: 0,
      createdAt: iso(-1),
    },
  ];

  const contributions: Contribution[] = [
    {
      id: "ct-1",
      campaignId: "c-solar-lantern",
      campaignTitle: "SolarLeaf: Off-Grid Lanterns for Rural Classrooms",
      supporterEmail: "lena@fundspring.io",
      supporterName: "Lena Park",
      creatorEmail: "noah@fundspring.io",
      amount: 60,
      status: "approved",
      createdAt: iso(-12),
    },
    {
      id: "ct-2",
      campaignId: "c-braille-tablet",
      campaignTitle: "TouchType: An Affordable Refreshable Braille Tablet",
      supporterEmail: "lena@fundspring.io",
      supporterName: "Lena Park",
      creatorEmail: "noah@fundspring.io",
      amount: 40,
      status: "approved",
      createdAt: iso(-10),
    },
    {
      id: "ct-3",
      campaignId: "c-night-market",
      campaignTitle: "The Riverside Night Market: A Home for 40 Local Makers",
      supporterEmail: "marcus@fundspring.io",
      supporterName: "Marcus Bell",
      creatorEmail: "priya@fundspring.io",
      amount: 25,
      status: "pending",
      createdAt: iso(-3),
    },
    {
      id: "ct-4",
      campaignId: "c-choir",
      campaignTitle: "The Midnight Choir: A Free Album for Night-Shift Workers",
      supporterEmail: "marcus@fundspring.io",
      supporterName: "Marcus Bell",
      creatorEmail: "priya@fundspring.io",
      amount: 30,
      status: "pending",
      createdAt: iso(-2),
    },
    {
      id: "ct-5",
      campaignId: "c-clinic-fridge",
      campaignTitle: "ColdChain: Solar Vaccine Fridges for Remote Clinics",
      supporterEmail: "lena@fundspring.io",
      supporterName: "Lena Park",
      creatorEmail: "noah@fundspring.io",
      amount: 100,
      status: "approved",
      createdAt: iso(-9),
    },
    {
      id: "ct-6",
      campaignId: "c-tabletop",
      campaignTitle: "Lanterns & Lore: A Cozy Tabletop RPG About Kindness",
      supporterEmail: "marcus@fundspring.io",
      supporterName: "Marcus Bell",
      creatorEmail: "diego@fundspring.io",
      amount: 20,
      status: "rejected",
      createdAt: iso(-6),
    },
  ];

  const payments: Payment[] = [
    {
      id: "p-1",
      userEmail: "lena@fundspring.io",
      type: "credit-purchase",
      credits: 300,
      amountUsd: 25,
      method: "Stripe",
      reference: "seed_pi_300",
      createdAt: iso(-40),
    },
    {
      id: "p-2",
      userEmail: "lena@fundspring.io",
      type: "credit-purchase",
      credits: 100,
      amountUsd: 10,
      method: "Stripe",
      reference: "seed_pi_100",
      createdAt: iso(-20),
    },
    {
      id: "p-3",
      userEmail: "marcus@fundspring.io",
      type: "credit-purchase",
      credits: 100,
      amountUsd: 10,
      method: "Stripe",
      reference: "seed_pi_100b",
      createdAt: iso(-16),
    },
    {
      id: "p-4",
      userEmail: "noah@fundspring.io",
      type: "withdrawal",
      credits: 400,
      amountUsd: 20,
      method: "Stripe",
      reference: "seed_wd_400",
      createdAt: iso(-11),
    },
  ];

  const withdrawals: Withdrawal[] = [
    {
      id: "w-1",
      creatorEmail: "noah@fundspring.io",
      creatorName: "Noah Whitfield",
      credits: 400,
      amountUsd: 20,
      method: "Stripe",
      accountNumber: "acct_****4821",
      status: "approved",
      createdAt: iso(-11),
    },
    {
      id: "w-2",
      creatorEmail: "priya@fundspring.io",
      creatorName: "Priya Nair",
      credits: 300,
      amountUsd: 15,
      method: "PayPal",
      accountNumber: "priya@paypal.me",
      status: "pending",
      createdAt: iso(-4),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: "n-1",
      message: "Lena Park contributed 100 credits to ColdChain.",
      toEmail: "noah@fundspring.io",
      actionRoute: "/dashboard/creator/home",
      time: iso(-9),
      read: false,
    },
    {
      id: "n-2",
      message: "Your contribution to TouchType was approved. Thank you!",
      toEmail: "lena@fundspring.io",
      actionRoute: "/dashboard/supporter/my-contributions",
      time: iso(-10),
      read: true,
    },
    {
      id: "n-3",
      message: "New campaign 'RainKeeper' is awaiting your approval.",
      toEmail: "admin@fundspring.io",
      actionRoute: "/dashboard/admin/campaign-approvals",
      time: iso(-2),
      read: false,
    },
  ];

  const reports: Report[] = [
    {
      id: "r-1",
      reporterEmail: "marcus@fundspring.io",
      reporterName: "Marcus Bell",
      campaignId: "c-tabletop",
      campaignTitle: "Lanterns & Lore: A Cozy Tabletop RPG About Kindness",
      reason: "Reward tiers changed after I contributed — asking for a review.",
      status: "open",
      createdAt: iso(-5),
    },
  ];

  return {
    users,
    campaigns,
    contributions,
    payments,
    withdrawals,
    notifications,
    reports,
  };
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Aisha Rahman",
    role: "Backed 14 campaigns",
    photo: "https://i.pravatar.cc/200?img=47",
    quote:
      "I funded a solar lantern project and watched a whole classroom light up on the impact reports. FundSpring makes the distance between giving and seeing feel tiny.",
  },
  {
    id: "t-2",
    name: "Tomás Herrera",
    role: "Creator · OpenReef",
    photo: "https://i.pravatar.cc/200?img=52",
    quote:
      "The credit model kept our budgeting honest. We raised what we needed, withdrew cleanly, and never once wrangled a spreadsheet of payment fees.",
  },
  {
    id: "t-3",
    name: "Grace Okonkwo",
    role: "Backed 6 campaigns",
    photo: "https://i.pravatar.cc/200?img=26",
    quote:
      "What sold me was the review step. Every campaign is checked before it goes live, so I know my credits are going to real people with real plans.",
  },
  {
    id: "t-4",
    name: "Ravi Menon",
    role: "Creator · Story Bikes",
    photo: "https://i.pravatar.cc/200?img=59",
    quote:
      "We launched a rolling library with two bikes and a dream. Six weeks later we were reading to kids on a route that never had a library. This platform got us there.",
  },
  {
    id: "t-5",
    name: "Sofia Lindqvist",
    role: "Backed 21 campaigns",
    photo: "https://i.pravatar.cc/200?img=32",
    quote:
      "The dashboard shows exactly where every credit went. I have never felt more in control of my giving, and the reminders when a project succeeds are the best kind of mail.",
  },
  {
    id: "t-6",
    name: "Daniel Abara",
    role: "Creator · ColdChain",
    photo: "https://i.pravatar.cc/200?img=68",
    quote:
      "Approvals were fast, supporters were generous, and the notifications kept everyone in the loop. We equipped three remote clinics in a single season.",
  },
];
