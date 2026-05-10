"use client";

import Map from "@/assets/icons/map";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import DarkLight from "@/assets/icons/dark-light";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
  timeZoneName: "short",
});

const AppHeader = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [time, setTime] = useState(dateFormat.format(new Date()));

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dateFormat.format(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 h-15 flex w-full flex-col bg-transparent z-10 transition-transform duration-200 ease-out",
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
            <Map className="text-primary" />
            <span className="text-sm font-heading tracking-wider font-medium text-primary">
              NATURAL EVENTS TRACKER
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] hidden md:block text-primary tabular-nums">
            {time}
          </span>
          <Button onClick={toggleTheme} size="icon" variant="outline">
            <DarkLight />
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
