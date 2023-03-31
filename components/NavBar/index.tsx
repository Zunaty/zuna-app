import Link from "next/link";
import { Fragment, useContext } from "react";
import { ThemeContext } from "@/context/theme";

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
];

const workLinks = [
  { href: "https://www.linkedin.com/in/victorlperez/", label: "LinkedIn" },
  { href: "/", label: "Resume" },
];

const NavBar = () => {
  const { theme, toggleTheme } = useContext<ThemeContextType>(ThemeContext);

  if (typeof window !== "undefined") {
    document.body.style.backgroundColor =
      theme === "light" ? "#F8FFF4" : "#474350";
    document.body.style.color = theme === "light" ? "#474350" : "#F8FFF4";
    document.body.style.transition = "all 0.25s linear";
  }

  return (
    <>
      <div className="flex justify-between items-center w-full max-w-screen-2xl h-fit px-5 mx-auto">
        <Link
          href="/"
          className="text-[2rem]"
        >
          VLP
        </Link>

        <div className="flex gap-5">
          <div className="flex gap-5 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 bg-clip-text">
            {siteLinks.map(({ href, label }, index) => (
              <Fragment key={index}>
                <Link
                  href={href}
                  className="text-[1.2rem] font-medium hover:text-transparent transition-all ease-in-out duration-500"
                >
                  {label}
                </Link>
              </Fragment>
            ))}
          </div>

          <button onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </>
  );
};

export default NavBar;
