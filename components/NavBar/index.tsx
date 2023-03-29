import Link from "next/link";
import { useContext } from "react";
import { ThemeContext } from "@/context/theme";

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

const workLinks = [
  { href: "https://www.linkedin.com/in/victorlperez/", label: "LinkedIn" },
];

const NavBar = () => {
  const { theme, toggleTheme } = useContext<ThemeContextType>(ThemeContext);

  return (
    <>
      <div className="flex justify-between items-center w-full h-[50px]">
        <Link
          href="/"
          className="text-[3rem]"
        >
          VLP
        </Link>

        <div>
          {siteLinks.map(({ href, label }) => (
            <Link
              key={`${href}${label}`}
              href={href}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavBar;
