const middleName = "Leonardo";

/** Set to `false` for "Victor Leonardo Perez" on formal surfaces (resume, metadata). */
const useMiddleInitial = true;

const formalName = useMiddleInitial ? "Victor L. Perez" : `Victor ${middleName} Perez`;

export const site = {
  /** Resume, metadata, footer, OG image */
  name: formalName,
  /** Hero, about page, conversational copy */
  displayName: "Victor",
  middleName,
  title: "Full Stack Engineer",
  tagline: "I build fast, polished web experiences — and sneak in a little game design along the way.",
  email: "Zunaty@gmail.com",
  location: "United States",
} as const;

export const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/victorlperez/",
  },
  {
    label: "GitHub",
    href: "https://github.com/Zunaty",
  },
] as const;

export const comingSoonLinks = [
  { label: "Playground", href: "/playground", description: "Art Roulette & mini-games" },
  { label: "Explore", href: "/explore", description: "Pokédex, Star Wars & API demos" },
] as const;
