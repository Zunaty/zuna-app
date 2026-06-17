import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24">
      <section className="flex max-w-3xl flex-col gap-6">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Phase 0 · Foundation</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Portfolio, playground, and things to explore.</h1>
        <p className="text-lg text-muted-foreground">
          A fresh start for zuna-app — Next.js 16, TypeScript, Tailwind, and shadcn/ui. Games, explore zones, and
          achievements are on the way.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg">Coming in Phase 1</Button>
          <Button variant="outline" size="lg" disabled>
            Playground
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Portfolio",
            description: "About, projects, resume, and contact.",
          },
          {
            title: "Playground",
            description: "Art Roulette, mini-games, and scores.",
          },
          {
            title: "Explore",
            description: "Pokédex, Star Wars, and more API demos.",
          },
        ].map((card) => (
          <article key={card.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
