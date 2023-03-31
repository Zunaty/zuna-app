// Next / React
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

// Components
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Hero from "@/components/Home/Hero";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>VLP App</title>
        <meta
          name="description"
          content="Victor L. Perez Portfolio App"
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

      <main className="w-full max-w-screen-2xl p-5 mx-auto">
        <Hero />
      </main>

      <Footer />
    </>
  );
};

export default Home;
