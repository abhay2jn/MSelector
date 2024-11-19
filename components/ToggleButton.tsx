"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function ToggleButton() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDarkMode}
      className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-white dark:bg-white dark:text-gray-900 dark:border-gray-200 dark:hover:bg-gray-200 dark:hover:text-gray-900"
    >
      {darkMode ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  );
}
