import Head from "next/head";

// Components
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Projects = () => {
  return (
    <>
      <Head>
        <title>Projects</title>
        <meta
          name="description"
          content="VLP Projects Page"
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
          <h1 className="text-[3rem]">Projects Page</h1>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Projects;
