import React, { useState, useEffect } from "react";
import TextLoop from "react-text-loop";

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "TailwindCSS",
  "Node.js",
  "Express",
  "MongoDB",
  "Solidity",
  "Ethereum",
  "UI/UX",
  "Figma",
];

export default function Hero() {
  return (
    <>
      <div className="flex flex-col w-full">
        <h1 className="text-[3rem]">I'm a fullstack developer</h1>
        <h2 className="text-[2rem]">With experience in</h2>
        <TextLoop
          interval={200}
          springConfig={{ stiffness: 180, damping: 8 }}
          children={skills}
        />
      </div>
    </>
  );
}
