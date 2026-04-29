"use client";

import Map from "@/assets/icons/map";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useCallback } from "react";

const AppHeader = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  }, [resolvedTheme, setTheme]);

  return (
    <header
      className={cn(
        "fixed top-0 h-15 flex w-full flex-col bg-background backdrop-blur-lg z-10 transition-transform duration-200 ease-out",
      )}
    >
      <nav
        className={cn(
          "top-0 flex h-full items-center justify-between px-2 sm:px-4",
        )}
      >
        <div className="flex items-center gap-0">
          <Link
            href="/"
            className="shrink-0 flex items-center text-foreground gap-1.5 transition-colors text-xs tracking-tight"
          >
            <Map />
            <span className="text-sm font-heading tracking-wider text-foreground">
              NATURAL EVENTS TRACKER
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <Button onClick={toggleTheme}>Theme Toggle</Button>
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
