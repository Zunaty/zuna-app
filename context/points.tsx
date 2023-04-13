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

interface UserData {
  totalPoints: number;
  navLink: {
    logoClicked: boolean;
    homeClicked: boolean;
    aboutClicked: boolean;
    projectsClicked: boolean;
  };
  themeSwitchClicked: boolean;
  projects: {
    project1Clicked: boolean;
    project2Clicked: boolean;
    project3Clicked: boolean;
  };
  skills: {
    searchClicked: boolean;
  };
}

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const [userData, setUserData] = useState<UserData>(() => {
    const savedUserData =
      typeof window !== "undefined" ? localStorage.getItem("userData") : null;

    if (savedUserData) {
      return JSON.parse(savedUserData);
    } else {
      return {
        totalPoints: 0,
        navLink: {
          logoClicked: false,
          homeClicked: false,
          aboutClicked: false,
          projectsClicked: false,
        },
        themeSwitchClicked: false,
        projects: {
          project1Clicked: false,
          project2Clicked: false,
          project3Clicked: false,
        },
        skills: {
          searchClicked: false,
        },
      };
    }
  });

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));
  }, [userData]);

  const addPoints = (amount: number) => {
    setUserData((prevUserData) => {
      const newTotalPoints = prevUserData.totalPoints + amount;

      return {
        ...prevUserData,
        totalPoints: newTotalPoints,
      };
    });
  };

  useEffect(() => {
    let numberOfClicks = 0;

    for (const key in userData) {
      if (typeof userData[key] === "boolean" && userData[key] === true) {
        numberOfClicks += 1;
      } else if (typeof userData[key] === "object") {
        for (const subKey in userData[key]) {
          if (
            typeof userData[key][subKey] === "boolean" &&
            userData[key][subKey] === true
          ) {
            numberOfClicks += 1;
          }
        }
      }
    }

    setUserData((prevUserData) => {
      const newTotalPoints = prevUserData.totalPoints + numberOfClicks;

      return {
        ...prevUserData,
        totalPoints: newTotalPoints,
      };
    });
  }, []);

  return (
    <PointsContext.Provider value={{ points: userData.totalPoints, addPoints }}>
      {children}
    </PointsContext.Provider>
  );
};
