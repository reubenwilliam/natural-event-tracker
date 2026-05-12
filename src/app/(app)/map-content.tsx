"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { LoaderGlitchText } from "@/components/ui/loader-glitch-text";
import { Marquee } from "@/components/ui/marquee";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EonetCategory,
  EonetEvent,
  EonetMagnitude,
  EonetSource,
} from "@/types/eonet";
import dynamic from "next/dynamic";

interface MapContentProps {
  events: EonetEvent[];
  categories: EonetCategory[];
  sources: EonetSource[];
  magnitudes: EonetMagnitude[];
}

const Map = dynamic(() => import("@/components/map/map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center place-items-center bg-background h-full">
      <LoaderGlitchText
        text="LOADING..."
        intensity="heavy"
        className="text-xs"
      />
    </div>
  ),
});

const MapContent = ({
  categories,
  events,
  sources,
  magnitudes,
}: MapContentProps) => {
  const marqueeDuration = `${Math.max(20, events.length * 3.5)}s`;

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 overflow-y-hidden">
        <Map events={events} />
      </div>
      <div className="absolute bottom-48 top-24 right-4 w-75 border border-primary/50 dark:border-primary bg-background/20 p-1.5 pointer-events-auto gap-2 overflow-auto no-scrollbar">
        <span className="font-heading font-bold text-[11px] tracking-widest text-primary pl-1">
          FILTER:
        </span>
        <div className="flex flex-col items-start gap-2 p-0.5">
          <div className="border-b border-primary/50 dark:border-primary w-full">
            <span className="font-number text-[10px] text-primary uppercase">
              CATEGORIES
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pointer-events-auto">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-1">
                <Checkbox />
                <span className="font-number text-[9px]">{c.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 p-0.5">
          <div className="border-b border-primary/50 dark:border-primary w-full">
            <span className="font-number text-[10px] text-primary uppercase">
              SOURCES
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pointer-events-auto">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center gap-1">
                <Checkbox />
                <span
                  className="font-number text-[9px] truncate"
                  title={s.title}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 p-0.5">
          <div className="border-b border-primary/50 dark:border-primary w-full">
            <span className="font-number text-[10px] text-primary uppercase">
              MAGNITUDES
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pointer-events-auto">
            {magnitudes.map((m) => (
              <div key={m.id} className="flex items-center gap-1">
                <Checkbox />
                <span
                  className="font-number text-[9px] truncate"
                  title={m.name}
                >
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 inset-x-4 pointer-events-none">
        <div className="w-fit border border-primary/50 dark:border-primary p-1.5 gap-2 bg-background/20 mb-2">
          <span className="font-heading font-bold text-[11px] tracking-widest text-primary pl-1">
            KEY:
          </span>
          <div className="grid grid-cols-2 gap-2.5 pointer-events-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-1">
                <span
                  className={`h-2 w-2 rounded-xs ${getCategoryColor(category.id)}`}
                />
                <Tooltip>
                  <TooltipTrigger className="font-number text-[10px]">
                    {category.title}
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="font-number text-[9px]">
                      {category.description}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
        <Marquee
          pauseOnHover
          duration={marqueeDuration}
          className="text-[9px] border border-primary/50 dark:border-primary bg-background/20 font-number pointer-events-auto"
        >
          {events.map((event) => (
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

const getCategoryColor = (categoryId: string) => {
  switch (categoryId) {
    case "drought":
      return "bg-yellow-500";
    case "dustHaze":
      return "bg-taupe-500";
    case "wildfires":
      return "bg-red-500";
    case "floods":
      return "bg-blue-600";
    case "severeStorms":
      return "bg-indigo-500";
    case "volcanoes":
      return "bg-fuchsia-500";
    case "waterColor":
      return "bg-green-500";
    case "landslides":
      return "bg-rose-400";
    case "seaLakeIce":
      return "bg-cyan-400";
    case "earthquakes":
      return "bg-slate-600";
    case "snow":
      return "bg-slate-300";
    case "tempExtremes":
      return "bg-orange-700";
    case "manmade":
      return "bg-lime-500";
    default:
      return "bg-primary";
  }
};

export default MapContent;
