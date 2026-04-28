"use client";

import { cn } from "@/lib/utils";

const AppHeader = () => {
  return (
    <header
      className={cn(
        "fixed top-0 h-10 flex w-full flex-col bg-background backdrop-blur-lg z-10 transition-transform duration-200 ease-out",
      )}
    >
      <nav
        className={cn(
          "top-0 flex h-full items-center justify-between px-2 sm:px-4",
        )}
      >
        <div className="flex items-center gap-0"></div>
      </nav>
    </header>
  );
};

export default AppHeader;
