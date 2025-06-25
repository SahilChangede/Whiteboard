import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const stored = JSON.parse(localStorage.getItem("userProfile"));
    if (stored?.theme) return stored.theme;
    return "auto"; // default
  };

  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");

    if (theme === "light") {
      html.classList.add("light");
    } else if (theme === "dark") {
      html.classList.add("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.classList.add(prefersDark ? "dark" : "light");
    }

    // Also update userProfile in localStorage
    const storedData = JSON.parse(localStorage.getItem("userProfile")) || {};
    localStorage.setItem("userProfile", JSON.stringify({ ...storedData, theme }));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
