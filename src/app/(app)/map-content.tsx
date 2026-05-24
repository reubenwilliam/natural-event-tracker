"use client";

import FilterGroup from "@/components/map/filter-group";
import { Label } from "@/components/ui/label";
import { LoaderGlitchText } from "@/components/ui/loader-glitch-text";
import { Marquee } from "@/components/ui/marquee";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
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
  STATUS_VALUES,
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

  const [pending, startTransition] = useTransition();

  const [filterOpen, setFilterOpen] = useState(false);

  const currentStatus = searchParams.get("status") || "open";

  let maxDays = "365";
  if (currentStatus === "closed") maxDays = "120";
  if (currentStatus === "all") maxDays = "60";

  const urlDays = searchParams.get("days");
  const initialDays = urlDays ? parseInt(urlDays, 10) : maxDays;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedMagnitudes, setSelectedMagnitudes] = useState<string[]>([]);

  const deferredCategories = useDeferredValue(selectedCategories);
  const deferredSources = useDeferredValue(selectedSources);
  const deferredMagnitudes = useDeferredValue(selectedMagnitudes);
  const deferredDays = useDeferredValue(Number(initialDays));

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

  const magnitudeCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    events.forEach((event) => {
      const latestGeometry = event.geometry[event.geometry.length - 1];

      if (latestGeometry) {
        const unit = latestGeometry.magnitudeUnit || "-";
        counts[unit] = (counts[unit] || 0) + 1;
      }
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

  const handleStatusChange = (newStatus: string) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (newStatus === "open") {
        newParams.delete("status");
      } else {
        newParams.set("status", newStatus);
      }

      newParams.delete("days");
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  const handleDaysCommit = (newValue: number[]) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("days", newValue[0].toString());
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  const marqueeDuration = `${Math.max(10, events.length * 0.5)}s`;

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 overflow-y-hidden">
        <div
          className={`h-full w-full transition-opacity duration-300 ${pending ? "opacity-50 pointer-events-auto grayscale-[0.5]" : "opacity-100"}`}
        >
          <Map
            events={filteredEvents}
            toggleFilter={() => setFilterOpen(!filterOpen)}
          />
        </div>
        {pending && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <LoaderGlitchText
              text="LOADING..."
              intensity="medium"
              className="text-xs"
            />
          </div>
        )}
      </div>
      {filterOpen && (
        <div className="absolute bottom-48 top-24 right-4 w-75 border border-primary/50 dark:border-primary bg-background/80 p-1.5 pointer-events-auto gap-2 overflow-auto no-scrollbar">
          <span className="font-heading font-bold text-xs tracking-widest text-primary pl-1">
            FILTER:
          </span>
          <StatusFilter
            status={currentStatus}
            onStatusChange={handleStatusChange}
            disabled={pending}
          />
          <DayFilter
            key={currentStatus}
            initialValue={Number(initialDays)}
            onValueCommit={handleDaysCommit}
            maxValue={Number(maxDays)}
            disabled={pending}
          />
          <FilterGroup
            label="categories"
            items={categories}
            counts={categoryCounts}
            selected={selectedCategories}
            getId={(c) => c.id}
            getLabel={(c) => c.title}
            onToggle={(id) =>
              toggleFilter(id, selectedCategories, setSelectedCategories)
            }
          />
          <FilterGroup
            label="sources"
            items={sources}
            counts={sourceCounts}
            selected={selectedSources}
            getId={(s) => s.id}
            getLabel={(s) => s.title}
            onToggle={(id) =>
              toggleFilter(id, selectedSources, setSelectedSources)
            }
          />
          <FilterGroup
            label="magnitudes"
            items={magnitudes}
            counts={magnitudeCounts}
            selected={selectedMagnitudes}
            getId={(m) => m.unit}
            getLabel={(m) => m.name}
            onToggle={(unit) =>
              toggleFilter(unit, selectedMagnitudes, setSelectedMagnitudes)
            }
          />
        </div>
      )}
      <div className="absolute bottom-8 inset-x-4 pointer-events-none">
        <div className="w-fit hidden md:block border border-primary/50 dark:border-primary p-1.5 gap-2 bg-background/80 mb-2">
          <span className="font-heading font-bold text-xs tracking-widest text-primary pl-1">
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

function StatusFilter({
  status,
  onStatusChange,
  disabled,
}: {
  status: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="p-1">
      <div className="border-b border-primary/50 dark:border-primary w-full mb-2">
        <span className="font-number text-[11px] text-primary uppercase">
          STATUS
        </span>
      </div>
      <RadioGroup
        value={status || "open"}
        onValueChange={onStatusChange}
        className="grid grid-cols-3 gap-2 pointer-events-auto"
        disabled={disabled}
      >
        {STATUS_VALUES.map((s) => (
          <div key={s} className="flex items-center gap-1">
            <RadioGroupItem value={s} id={`status-${s}`} />
            <Label
              htmlFor={`status-${s}`}
              className="font-number text-[11px] cursor-pointer uppercase"
            >
              {s}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

function DayFilter({
  initialValue,
  onValueCommit,
  maxValue,
  disabled,
}: {
  initialValue: number;
  onValueCommit: (value: number[]) => void;
  maxValue: number;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="p-1">
      <div className="border-b border-primary/50 dark:border-primary w-full mb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-number text-[11px] text-primary uppercase">
            DAYS
          </span>
          <span className="font-number text-[10px] text-primary">{value}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(val) => setValue(val[0])}
        onValueCommit={onValueCommit}
        max={maxValue}
        step={5}
        disabled={disabled}
      />
    </div>
  );
}

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
