import React, { createContext, useState, useEffect } from "react";

export const PointsContext = createContext<{
  points: number;
  addPoints: (amount: number) => void;
}>({
  points: 0,
  addPoints: () => {},
});

type PointsProviderProps = {
  children: React.ReactNode;
};

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const [points, setPoints] = useState<number>(() => {
    const savedPoints = localStorage.getItem("points");
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("points", points.toString());
  }, [points]);

  const addPoints = (amount: number) => {
    setPoints((prevPoints) => prevPoints + amount);
  };

  return (
    <PointsContext.Provider value={{ points, addPoints }}>
      {children}
    </PointsContext.Provider>
  );
};
