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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

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
        intensity="medium"
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedMagnitudes, setSelectedMagnitudes] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number>(180);

  const deferredCategories = useDeferredValue(selectedCategories);
  const deferredSources = useDeferredValue(selectedSources);
  const deferredMagnitudes = useDeferredValue(selectedMagnitudes);
  const deferredDays = useDeferredValue(selectedDays);

  const isFetchingAll = searchParams.get("status") === "all";

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    events.forEach((event) => {
      event.categories.forEach((cat) => {
        counts[cat.id] = (counts[cat.id] || 0) + 1;
      });
    });

    return counts;
  }, [events]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    events.forEach((event) => {
      event.sources.forEach((src) => {
        counts[src.id] = (counts[src.id] || 0) + 1;
      });
    });

    return counts;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - deferredDays);
    const cutoffString = cutoffDate.toISOString();

    const categorySet = new Set(deferredCategories);
    const sourceSet = new Set(deferredSources);
    const magnitudeSet = new Set(deferredMagnitudes);

    return events.filter((event) => {
      if (
        categorySet.size > 0 &&
        !event.categories.some((cat) => categorySet.has(cat.id))
      ) {
        return false;
      }

      if (
        sourceSet.size > 0 &&
        !event.sources.some((src) => sourceSet.has(src.id))
      ) {
        return false;
      }

      const latestGeometry = event.geometry[event.geometry.length - 1];
      if (!latestGeometry) return false;

      if (latestGeometry.date <= cutoffString) {
        return false;
      }

      if (magnitudeSet.size > 0) {
        const unit = latestGeometry.magnitudeUnit;
        if (!unit && !magnitudeSet.has("unknown")) return false;
        if (unit && !magnitudeSet.has(unit)) return false;
      }

      return true;
    });
  }, [
    events,
    deferredCategories,
    deferredSources,
    deferredMagnitudes,
    deferredDays,
  ]);

  const toggleFilter = (
    id: string,
    currentList: string[],
    setList: (val: string[]) => void,
  ) => {
    setList(
      currentList.includes(id)
        ? currentList.filter((item) => item !== id)
        : [...currentList, id],
    );
  };

  const handleStatusToggle = (checked: boolean) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (checked) {
        newParams.set("status", "all");
      } else {
        newParams.delete("status");
      }
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  const marqueeDuration = `${Math.max(10, events.length * 1.5)}s`;

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 overflow-y-hidden">
        <Map events={filteredEvents} />
      </div>
      <div className="absolute bottom-48 top-24 right-4 w-75 border border-primary/50 dark:border-primary bg-background/80 p-1.5 pointer-events-auto gap-2 overflow-auto no-scrollbar hidden md:block">
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
            {categories.map((c) => {
              const count = categoryCounts[c.id] || 0;
              const disabled = count === 0;

              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-1 ${disabled ? "opacity-40" : ""}`}
                >
                  <Checkbox
                    checked={selectedCategories.includes(c.id)}
                    onCheckedChange={() =>
                      toggleFilter(
                        c.id,
                        selectedCategories,
                        setSelectedCategories,
                      )
                    }
                    disabled={disabled}
                  />
                  <span className="font-number text-[9px]">
                    {c.title} ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 p-0.5">
          <div className="border-b border-primary/50 dark:border-primary w-full">
            <span className="font-number text-[10px] text-primary uppercase">
              SOURCES
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pointer-events-auto">
            {sources.map((s) => {
              const count = sourceCounts[s.id] || 0;
              const disabled = count === 0;

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-1 ${disabled ? "opacity-40" : ""}`}
                >
                  <Checkbox
                    checked={selectedSources.includes(s.id)}
                    onCheckedChange={() =>
                      toggleFilter(s.id, selectedSources, setSelectedSources)
                    }
                    disabled={disabled}
                  />
                  <span
                    className="font-number text-[9px] truncate"
                    title={s.title}
                  >
                    {s.title}
                  </span>
                  <span className="font-number text-[9px]">({count})</span>
                </div>
              );
            })}
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
                <Checkbox
                  checked={selectedMagnitudes.includes(m.unit)}
                  onCheckedChange={() =>
                    toggleFilter(
                      m.unit,
                      selectedMagnitudes,
                      setSelectedMagnitudes,
                    )
                  }
                />
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
        <div className="w-fit hidden md:block border border-primary/50 dark:border-primary p-1.5 gap-2 bg-background/80 mb-2">
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
          className="text-[9px] border border-primary/50 dark:border-primary bg-background/80 font-number pointer-events-auto"
        >
          {filteredEvents.slice(0, 50).map((event) => (
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
