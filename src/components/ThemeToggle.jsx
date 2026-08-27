import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "deployCode_theme";

function getInitialTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, theme);
  }, [isDark, theme]);

  const toggleTheme = () => setTheme((currentTheme) => (
    currentTheme === "dark" ? "light" : "dark"
  ));

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="theme-toggle"
    >
      {isDark ? <Sun className="h-4 w-4" strokeWidth={2.5} /> : <Moon className="h-4 w-4" strokeWidth={2.5} />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
