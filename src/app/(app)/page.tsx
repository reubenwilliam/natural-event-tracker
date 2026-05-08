"use client";

import { Marquee } from "@/components/ui/marquee";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map/map"), {
  ssr: false,
  loading: () => <div></div>,
});

const Page = () => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 overflow-y-hidden">
        <Map />
      </div>
      <div className="absolute bottom-8 inset-x-4">
        <Marquee
          pauseOnHover
          repeat={5}
          className="text-[9px] border border-primary/50 dark:border-primary bg-primary/10"
        >
          <span className="gap-4">EVENTS GO HERE...</span>
        </Marquee>
      </div>
    </div>
  );
};

export default Page;
