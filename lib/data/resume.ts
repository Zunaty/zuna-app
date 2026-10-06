export type Experience = {
  role: string;
  company: string;
  period: string;
  location?: string;
  employment?: string;
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

export const earlierExperience: Experience[] = [
  {
    role: "Food Packer",
    company: "Pete's Meals",
    employment: "Part-time",
    period: "May 2020 — Dec 2021",
    location: "Sandy, Utah",
    bullets: [
      "Assisted in the preparation of meals for a newly established meal packing service.",
      "Maintained cleanliness and organization of the work area to ensure efficient operations.",
      "Collaborated with a small team to deliver quality meals to customers.",
      "Contributed quality assurance insights to enhance the company website's user experience.",
    ],
  },
  {
    role: "Barback",
    company: "Hoppers Bar & Grill",
    employment: "Part-time",
    period: "May 2015 — Aug 2020",
    location: "Salt Lake City, Utah",
    summary: "Also served, bussed, washed dishes, and worked catering — every role short of management.",
    bullets: [
      "Filled in across the restaurant so service could keep moving on busy shifts.",
      "Developed customer service skills while collaborating with team members in a fast-paced restaurant environment.",
      "Supported events and catering from setup through guest service and breakdown.",
    ],
  },
  {
    role: "Data Entry Specialist",
    company: "Intermountain Healthcare",
    period: "Jun 2017 — Jul 2017",
    location: "Salt Lake City, Utah",
    bullets: [
      "Managed data entry tasks using Excel and Word to ensure accurate data handling.",
      "Successfully transferred training software from an outdated system to a new platform, enhancing operational efficiency.",
      "Collaborated with team members at Intermountain Healthcare to streamline data processes in a fast-paced environment.",
    ],
  },
  {
    role: "Data Entry Specialist",
    company: "BoardCo Inc.",
    period: "Sep 2014 — Apr 2015",
    location: "Provo, Utah",
    bullets: [
      "Edited product items using website software to ensure accurate online representation.",
      "Managed inventory effectively, maintaining organized records for seamless operations.",
      "Transferred data from the old website to the new platform, enhancing user experience.",
      "Utilized Excel and Word to create and update product listings, improving accessibility.",
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
