// Next / React
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

// Components
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

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

      <main>
        <div className="flex flex-col items-center justify-center w-full h-screen">
          <h1 className="text-[3rem]">Home Page</h1>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;
