import { NextPage } from "next";
import Head from "next/head";

// Components
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>About</title>
        <meta
          name="description"
          content="VLP About Page"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <NavBar />

      <main className="min-h-screen">
        <div className="flex flex-col items-center justify-center w-full h-screen">
          <h1 className="text-[3rem]">About Page</h1>

          <p className="text-[1.5rem]">About Me Paragraph</p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default About;
