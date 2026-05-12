"use client";

import { Marquee } from "@/components/ui/marquee";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EonetCategory, EonetEvent } from "@/types/eonet";
import dynamic from "next/dynamic";

interface MapContentProps {
  initialEvents: EonetEvent[];
  initialCategories: EonetCategory[];
}

const Map = dynamic(() => import("@/components/map/map"), {
  ssr: false,
  loading: () => <div></div>,
});

const MapContent = ({ initialCategories, initialEvents }: MapContentProps) => {
  const marqueeDuration = `${Math.max(20, initialEvents.length * 3.5)}s`;

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 overflow-y-hidden">
        <Map events={initialEvents} />
      </div>
      <div className="absolute bottom-8 inset-x-4 pointer-events-none">
        <div className="w-fit border border-primary/50 dark:border-primary p-1.5 gap-2  bg-background/20 mb-2">
          <span className="font-heading text-[11px] tracking-widest text-primary pl-1">
            KEY:
          </span>
          <div className="grid grid-cols-2 gap-2.5 pointer-events-auto">
            {initialCategories.map((category: EonetCategory) => (
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
          {initialEvents.map((event: EonetEvent) => (
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

const getCategoryColor = (categoryId: number) => {
  switch (categoryId) {
    case 6:
      return "bg-yellow-500";
    case 7:
      return "bg-taupe-500";
    case 8:
      return "bg-red-500";
    case 9:
      return "bg-blue-600";
    case 10:
      return "bg-indigo-500";
    case 12:
      return "bg-fuchsia-500";
    case 13:
      return "bg-green-500";
    case 14:
      return "bg-rose-400";
    case 15:
      return "bg-cyan-400";
    case 16:
      return "bg-slate-600";
    case 17:
      return "bg-slate-300";
    case 18:
      return "bg-orange-700";
    case 19:
      return "bg-lime-500";
    default:
      return "bg-primary";
  }
};

export default MapContent;
