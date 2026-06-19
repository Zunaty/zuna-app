export type Project = {
  slug: string;
  title: string;
  employer?: string;
  description: string;
  highlights: string[];
  siteUrl?: string;
  skills: string[];
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "comedy-platform",
    title: "Comedy & Event Discovery Platform",
    employer: "Koggin Labs",
    description:
      "AI-informed comedy and event discovery platform — public marketing site, admin dashboard, and shared Supabase layer in a Next.js monorepo.",
    highlights: [
      "Next.js 16 monorepo with public web app and internal dashboard",
      "Supabase auth, RLS, typed database layer, and landing page builder",
      "Automated testing, CI, and engineering standards across workspaces",
    ],
    skills: ["Next.js", "Supabase", "TypeScript", "Monorepo", "Vitest"],
    featured: true,
  },
  {
    slug: "art-hero",
    title: "Art Hero — Creative AI Platform",
    employer: "Koggin Labs",
    description:
      "AI-powered creative tooling with image generation, e-commerce flows, and Art Roulette — a roguelike prompt-building game.",
    highlights: [
      "Vercel AI SDK and streaming API routes for generative workflows",
      "Complex client state for game mechanics and creative tooling",
      "Supabase auth and user-generated content pipelines",
    ],
    skills: ["Next.js", "AI SDK", "Supabase", "LangChain", "Game design"],
    featured: true,
  },
  {
    slug: "black-swan-research",
    title: "Blockchain Research & NFT Products",
    employer: "Black Swan Research",
    description:
      "Full-stack applications combining AI analysis of blockchain datasets with Web3 integrations, subscriptions, and NFT product launches.",
    highlights: [
      "NextAuth, Stripe, and MongoDB across multiple production apps",
      "OpenAI, LangChain, and Hugging Face for automated research workflows",
      "Thirdweb, Alchemy, and Moralis for Ethereum-based product features",
    ],
    skills: ["Next.js", "MongoDB", "NextAuth", "Stripe", "Web3", "AI"],
    featured: true,
  },
  {
    slug: "plan-3",
    title: "Plan_3 — Company Website",
    description:
      "Marketing site for a product ecosystem, built for clarity and conversion. Responsive layouts, component-driven UI, and analytics integration.",
    highlights: [
      "Next.js with SSR for performance and SEO",
      "UI/UX for ecosystem cards and product storytelling",
      "Google Analytics for behavior insights",
    ],
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "UI/UX", "Analytics"],
    featured: false,
  },
  {
    slug: "origins3",
    title: "Origins3 — Web3 Marketing",
    description:
      "Company website for a web3 marketing agency — bold brand presence, mobile-first, and fast iteration on landing content.",
    highlights: [
      "Responsive marketing pages with Tailwind",
      "Analytics-driven UX improvements",
      "Full-stack delivery from design to deploy",
    ],
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Marketing sites"],
    featured: false,
  },
];

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
