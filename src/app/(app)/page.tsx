"use client";

import { Marquee } from "@/components/ui/marquee";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map/map"), {
  ssr: false,
  loading: () => <div></div>,
});

const fetchEvents = async () => {
  const response = await fetch(
    "https://eonet.gsfc.nasa.gov/api/v2.1/events?status=open&days=30",
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events API.");
  }

  return response.json();
};

const Page = () => {
  const eventsQuery = useQuery({
    queryKey: ["eonet-events"],
    queryFn: fetchEvents,
  });

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 overflow-y-hidden">
        <Map events={eventsQuery.data?.events || []} />
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
