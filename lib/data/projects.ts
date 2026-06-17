export type Project = {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
  siteUrl?: string;
  skills: string[];
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "plan-3",
    title: "Plan_3 — Company Website",
    description:
      "Marketing site for a product ecosystem, built for clarity and conversion. Responsive layouts, component-driven UI, and analytics integration.",
    highlights: [
      "Next.js App Router with SSR for performance and SEO",
      "UI/UX for ecosystem cards and product storytelling",
      "Google Analytics for behavior insights",
    ],
    siteUrl: "https://www.plan3.io/",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "UI/UX", "Analytics"],
    featured: true,
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
    siteUrl: "https://www.origins3.io/",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Marketing sites"],
    featured: true,
  },
  {
    slug: "comedy-platform",
    title: "Comedy Platform — Events & Media",
    description:
      "Multi-app platform for comedy events, venues, comedians, podcasts, and admin tooling. Monorepo architecture with shared Supabase package.",
    highlights: [
      "Next.js 16 monorepo (public site + dashboard)",
      "Supabase auth, RLS, and typed database layer",
      "Landing page builder and media discovery",
    ],
    skills: ["Next.js", "Supabase", "TypeScript", "Monorepo", "RLS"],
    featured: true,
  },
  {
    slug: "art-hero",
    title: "Art Hero — Creative AI Platform",
    description:
      "AI-powered creative tooling with image generation, e-commerce flows, and Art Roulette — a roguelike prompt-building game.",
    highlights: [
      "Vercel AI SDK and streaming API routes",
      "Complex client state for game mechanics",
      "Supabase auth and user-generated content",
    ],
    skills: ["Next.js", "AI SDK", "Supabase", "Game design", "Konva"],
    featured: false,
  },
];

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
