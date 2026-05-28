"use client";

import Map from "@/assets/icons/map";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeSwitcher } from "./mode-switcher";

const AppHeader = () => {
  return (
    <header
      className={cn(
        "fixed top-0 h-15 flex w-full flex-col bg-transparent z-10 transition-transform duration-200 ease-out pointer-events-none",
      )}
    >
      <nav
        className={cn(
          "top-0 flex h-full items-center justify-between px-2 sm:px-4",
        )}
      >
        <div className="flex flex-col items-start gap-1 pointer-events-auto">
          <Link
            href="/"
            className="shrink-0 flex items-center text-foreground gap-1.5 transition-colors text-xs tracking-tight"
          >
            <Map className="text-primary" />
            <span className="text-sm font-heading tracking-wider font-medium text-primary">
              NATURAL EVENT TRACKER
            </span>
          </Link>
          <div className="flex items-center gap-1 pointer-events-none">
            <span className="text-[10px] uppercase font-number">
              SOURCE MATERIAL
            </span>
            <Link
              href="https://eonet.gsfc.nasa.gov/"
              className="text-[10px] font-number pointer-events-auto text-primary hover:underline tracking-wider"
              rel="noreferrer"
              target="_blank"
            >
              EONET|NASA
            </Link>
          </div>
        </div>
        <div className="items-center gap-2 pointer-events-auto hidden md:flex">
          <span className="text-xs uppercase font-number text-muted-foreground">
            MODE |
          </span>
          <ModeSwitcher />
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
