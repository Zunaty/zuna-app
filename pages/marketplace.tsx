import { NextPage } from "next";
import Head from "next/head";

// Components
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Marketplace: NextPage = () => {
  return (
    <>
      <Head>
        <title>Marketplace Example App</title>
        <meta
          name="description"
          content="VLP Marketplace Example App"
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
          <h1 className="text-[3rem]">Marketplace Page</h1>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Marketplace;
