"use client";

import { Marquee } from "@/components/ui/marquee";
import { EonetEvent } from "@/types/eonet";
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

  const events = eventsQuery.data?.events || [];

  const marqueeDuration = `${Math.max(20, events.length * 3.5)}s`;

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 overflow-y-hidden">
        <Map events={events} />
      </div>
      <div className="absolute bottom-8 inset-x-4">
        <Marquee
          pauseOnHover
          duration={marqueeDuration}
          className="text-[9px] border border-primary/50 dark:border-primary bg-background/20 font-number"
        >
          {eventsQuery.data?.events.map((event: EonetEvent) => (
            <div className="flex items-center gap-2" key={event.id}>
              <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              <span className="gap-4">{event.title}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default Page;
