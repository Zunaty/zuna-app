export const site = {
  name: "Victor Perez",
  title: "Full Stack Developer",
  tagline: "I build fast, polished web experiences — and sneak in a little game design along the way.",
  email: "hello@victorlperez.dev",
  location: "United States",
} as const;

export const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/victorlperez/",
  },
  {
    label: "GitHub",
    href: "https://github.com/victorlperez",
  },
] as const;

export const comingSoonLinks = [
  { label: "Playground", href: "/playground", description: "Art Roulette & mini-games" },
  { label: "Explore", href: "/explore", description: "Pokédex, Star Wars & API demos" },
] as const;
