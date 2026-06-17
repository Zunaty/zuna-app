export type Experience = {
  role: string;
  company: string;
  period: string;
  summary?: string;
  bullets: readonly string[];
};

export type Education = {
  school: string;
  credential: string;
  period?: string;
  bullets?: readonly string[];
};

export const experience: Experience[] = [
  {
    role: "Full Stack Engineer",
    company: "Koggin Labs",
    period: "Jan 2024 — Present",
    bullets: [
      "Built AI-powered web applications using Next.js, TypeScript, and Supabase, transforming generative AI workflows into customer-facing products.",
      "Developed and implemented automation pipelines that accelerated product development and reduced manual operational processes.",
      "Contributed to the architecture and development of an AI-driven comedy and event discovery platform focused on improving content and event recommendations.",
      "Established automated testing workflows and development standards to improve application reliability and deployment confidence.",
      "Collaborated directly with founders and stakeholders in a fast-paced startup environment to rapidly validate and launch new product initiatives.",
      "Supported projects from ideation through deployment, including technical planning, implementation, testing, and iteration.",
    ],
  },
  {
    role: "Full Stack Engineer",
    company: "Black Swan Research",
    period: "Jun 2022 — Jan 2024",
    bullets: [
      "Designed and developed full-stack web applications using Next.js, React, TypeScript, MongoDB, and Node.js.",
      "Built secure authentication and authorization systems using NextAuth while integrating Stripe payment processing for subscription and transaction-based products.",
      "Designed scalable database schemas, API routes, and backend services supporting multiple production applications.",
      "Integrated AI technologies including OpenAI, LangChain, and Hugging Face to analyze blockchain datasets and automate research workflows.",
      "Implemented Web3 functionality using Thirdweb, Alchemy, and Moralis to connect applications with Ethereum-based blockchain networks.",
      "Led development efforts for NFT and blockchain projects from concept and wireframing through production deployment.",
      "Managed application deployments using Vercel and maintained development workflows across GitHub repositories.",
      "Established Git branching, code review, and deployment processes that improved team collaboration and release stability.",
      "Performed application testing, debugging, and quality assurance throughout development and pre-production release cycles.",
    ],
  },
];

export const education: Education[] = [
  {
    school: "University of Utah",
    credential: "Full Stack Web Development Certificate",
    period: "2021",
    bullets: [
      "Completed immersive training in full-stack application development.",
      "Built responsive web applications using JavaScript, React, Node.js, databases, APIs, and modern development workflows.",
    ],
  },
  {
    school: "Devmountain",
    credential: "Software Quality Assurance",
    period: "2019",
    bullets: ["Learned software testing methodologies, bug reporting, test planning, and quality assurance processes."],
  },
  {
    school: "Westminster College",
    credential: "Flight Operations & Aviation Studies",
    period: "2009 — 2014",
    bullets: [
      "Earned Private Pilot certification and Instrument Flight Rating (IFR).",
      "Logged approximately 250 hours as Pilot in Command while developing leadership, communication, and risk management skills.",
    ],
  },
];
