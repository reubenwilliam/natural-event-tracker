"use client";

import Chain from "@/assets/icons/chain";
import Minus from "@/assets/icons/minus";
import Plus from "@/assets/icons/plus";
import { EonetEvent } from "@/types/eonet";
import { format } from "date-fns";
import L, { LatLngBoundsExpression, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";

const MIN_ZOOM = 2;
const CENTER = [0, 0] as [number, number];

const worldBounds: LatLngBoundsExpression = [
  [-90, -180],
  [90, 180],
];

interface MapProps {
  events: EonetEvent[];
}

interface CustomAttributionProps {
  position: L.ControlPosition;
}

function MapEventsComponent() {
  const map = useMapEvents({
    zoomend: () => {
      if (map.getZoom() <= MIN_ZOOM) {
        map.setView(CENTER, MIN_ZOOM);
        map.dragging.disable();
      } else {
        map.dragging.enable();
      }
    },
  });

  useEffect(() => {
    if (map.getZoom() <= MIN_ZOOM) {
      map.dragging.disable();
    }
  }, [map]);

  return null;
}

function MapControls() {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
    },
  });

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const reset = () => {
    map.flyTo(CENTER, MIN_ZOOM, { duration: 1.0 });
  };

  return (
    <div
      className="absolute bottom-18 inset-x-4 z-1000 flex items-end gap-0.5  justify-end pointer-events-none"
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1 items-end">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="pointer-events-auto"
            disabled={zoomLevel >= map.getMaxZoom()}
          >
            <Plus className="size-3" />
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="pointer-events-auto"
            disabled={zoomLevel <= map.getMinZoom()}
          >
            <Minus className="size-3" />
          </Button>
        </div>
        <div className="flex items-center gap-1 ">
          <Button
            variant="outline"
            className="text-[11px] font-heading uppercase tracking-widest pointer-events-auto hidden md:block"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span>FILTER</span>
          </Button>
          <Button
            variant="outline"
            className="text-[11px] font-heading uppercase tracking-widest pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
          >
            <span>RESET</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClosePopupModal({ onClose }: { onClose: () => void }) {
  return (
    <Button
      variant="ghost"
      className="rounded-none p-1 h-6"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <X className="size-3.5" />
    </Button>
  );
}

function MapBackgroundClick({
  clearActiveEvent,
}: {
  clearActiveEvent: () => void;
}) {
  useMapEvents({
    click: () => clearActiveEvent(),
  });
  return null;
}

function CustomAttribution({ position }: CustomAttributionProps) {
  const map = useMap();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const y = position.includes("bottom") ? "bottom" : "top";
    const x = position.includes("right") ? "right" : "left";
    const cornerSelector = `.leaflet-${y}.leaflet-${x}`;

    const controlContainer = map.getContainer().querySelector(cornerSelector);

    if (controlContainer) {
      const div = L.DomUtil.create("div", "leaflet-control");

      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      controlContainer.appendChild(div);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContainer(div);

      return () => {
        controlContainer.removeChild(div);
      };
    }
  }, [map, position]);

  return container
    ? createPortal(
        <div className="px-2 text-[9px] text-primary backdrop-blur font-heading">
          &copy;{" "}
          <a
            href="https://leafletjs.com/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--primary)" }}
            className="hover:underline"
          >
            Leaflet
          </a>
          <span className="mx-1 font-semibold text-primary">|</span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--primary)" }}
            className="hover:underline"
          >
            OpenStreetMap
          </a>
        </div>,
        container,
      )
    : null;
}

function ThemeTileLayer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const DEFAULT_URL =
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
  const DARK_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

  if (isDark) {
    return (
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={DARK_URL}
      />
    );
  }

  return (
    <TileLayer
      attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
      url={DEFAULT_URL}
    />
  );
}

const Map = ({ events }: MapProps) => {
  const [activeEvent, setActiveEvent] = useState<EonetEvent | null>(null);

  const eventsByCategory = useMemo(() => {
    const grouped: Record<string, EonetEvent[]> = {};
    events.forEach((event) => {
      const catId = event.categories[0].id || "default";
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(event);
    });
    return grouped;
  }, [events]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCustomClusterIcon = (cluster: any, categoryId: string) => {
    const count = cluster.getChildCount();
    const bgColor = getClusterBgClass(categoryId);

    let sizeClass = "h-8 w-8 text-xs";
    let pixelSize = 32;

    if (count >= 50) {
      sizeClass = "h-14 w-14 text-[16px]";
      pixelSize = 56;
    } else if (count >= 10) {
      sizeClass = "h-11 w-11 text-[14px]";
      pixelSize = 44;
    }

    return L.divIcon({
      html: `<div class="flex ${sizeClass} items-center justify-center rounded-full  ${bgColor} font-number font-bold text-black shadow-lg backdrop-blur-md transition-all duration-300">
        ${count}
      </div>`,
      className: "",
      iconSize: point(pixelSize, pixelSize, true),
    });
  };

  const RenderedClusters = useMemo(() => {
    return Object.entries(eventsByCategory).map(
      ([categoryId, categoryEvents]) => (
        <MarkerClusterGroup
          key={categoryId}
          chunkedLoading
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={(cluster: any) =>
            createCustomClusterIcon(cluster, categoryId)
          }
        >
          {categoryEvents?.map((event) => {
            const latestGeometry = event.geometry[event.geometry.length - 1];
            const catId = event.categories[0]?.id;

            if (latestGeometry.type === "Polygon") {
              const polygonCoords = latestGeometry.coordinates[0].map(
                (coordPair) => [coordPair[1], coordPair[0]] as [number, number],
              );
              const eventColor = getPolygonColor(catId);

              return (
                <Polygon
                  key={event.id}
                  positions={polygonCoords}
                  pathOptions={{
                    color: eventColor,
                    fillColor: eventColor,
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                />
              );
            }

            if (latestGeometry.type === "Point") {
              return (
                <Marker
                  key={event.id}
                  position={[
                    latestGeometry.coordinates[1],
                    latestGeometry.coordinates[0],
                  ]}
                  icon={getIconFactory(catId)}
                  eventHandlers={{
                    click: () =>
                      setActiveEvent((prev) =>
                        prev?.id === event.id ? null : event,
                      ),
                  }}
                />
              );
            }
          })}
        </MarkerClusterGroup>
      ),
    );
  }, [eventsByCategory]);

  return (
    <MapContainer
      center={CENTER}
      zoom={MIN_ZOOM}
      minZoom={MIN_ZOOM}
      maxBounds={worldBounds}
      maxBoundsViscosity={1.0}
      className="h-full w-full z-0"
      attributionControl={false}
      zoomControl={false}
      closePopupOnClick={false}
      style={{ backgroundColor: "var(--background)" }}
    >
      <ThemeTileLayer />

      <MapEventsComponent />
      <MapControls />
      <CustomAttribution position="bottomright" />

      <MapBackgroundClick clearActiveEvent={() => setActiveEvent(null)} />

      {RenderedClusters}

      {activeEvent &&
        (() => {
          const activeGeometry =
            activeEvent.geometry[activeEvent.geometry.length - 1];

          if (activeGeometry.type !== "Point") return null;

          const activeCategoryId = activeEvent.categories[0]?.id;
          const latDmsCoord = convertDecimalToDMS(
            activeGeometry.coordinates[1],
            "lat",
          );
          const lngDmsCoord = convertDecimalToDMS(
            activeGeometry.coordinates[0],
            "lng",
          );

          return (
            <Popup
              position={[
                activeGeometry.coordinates[1],
                activeGeometry.coordinates[0],
              ]}
              closeButton={false}
              className="theme-popup"
              offset={[7, 12]}
            >
              <div className="flex flex-col min-w-50 w-75">
                <div className="flex flex-col p-2">
                  <div className="flex justify-between items-center mb-2">
                    <div
                      className={`${getClusterBgClass(activeCategoryId)} p-0.5 uppercase font-number text-[10px]`}
                    >
                      <span className="text-current">
                        {activeEvent.categories[0].title}
                      </span>
                    </div>
                    <ClosePopupModal onClose={() => setActiveEvent(null)} />
                  </div>
                  <div className="flex flex-col gap-2 font-number">
                    <h3 className="text-[11px] font-semibold text-primary">
                      {activeEvent.title}
                    </h3>
                    {activeEvent.description && (
                      <span className="text-[9px] font-mono">
                        {activeEvent.description}
                      </span>
                    )}
                    {activeGeometry.magnitudeValue && (
                      <span className="text-[9px] font-number">
                        <span className="text-muted-foreground">
                          Magnitude:{" "}
                        </span>
                        {activeGeometry.magnitudeValue}{" "}
                        {activeGeometry.magnitudeUnit}
                      </span>
                    )}
                    <span className="text-[9px] font-number text-muted-foreground tracking-tighter">
                      {`${latDmsCoord.degrees}° ${latDmsCoord.minutes}' ${latDmsCoord.seconds}" ${latDmsCoord.direction}`}
                      ,{" "}
                      {`${lngDmsCoord.degrees}° ${lngDmsCoord.minutes}' ${lngDmsCoord.seconds}" ${lngDmsCoord.direction}`}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-[9px] text-muted-foreground font-number">
                      {format(new Date(activeGeometry.date), "PPP")}
                    </span>
                    <Link
                      href={activeEvent.sources[0].url}
                      className="text-[9px] font-mono hover:underline text-muted-foreground decoration-primary"
                      style={{ color: "var(--foreground)" }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="text-muted-foreground hover:text-primary flex items-center gap-0.5">
                        <span>Source</span>
                        <Chain className="size-2" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          );
        })()}
    </MapContainer>
  );
};

const createPingIcon = (colorClass: string, categoryId: string) => {
  return L.divIcon({
    className: "",
    html: `<span class="relative flex h-8 w-8 items-center justify-center">
        <span class="absolute inline-flex h-full w-full animate-ping animation-duration-[2.5s] rounded-full ${colorClass} opacity-75"></span>
        <span class="relative inline-flex h-3 w-3 rounded-full ${colorClass}"></span>
      </span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    categoryId: categoryId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

const ICONS = {
  drought: createPingIcon("bg-yellow-500", "drought"),
  wildfire: createPingIcon("bg-red-500", "wildfires"),
  dust: createPingIcon("bg-taupe-500", "dustHaze"),
  earthquake: createPingIcon("bg-slate-600", "earthquakes"),
  flood: createPingIcon("bg-blue-500", "floods"),
  landslide: createPingIcon("bg-rose-400", "landslides"),
  manmade: createPingIcon("bg-lime-500", "manmade"),
  ice: createPingIcon("bg-cyan-500", "seaLakeIce"),
  storm: createPingIcon("bg-indigo-500", "severeStorms"),
  snow: createPingIcon("bg-slate-300", "snow"),
  temperature: createPingIcon("bg-orange-700", "tempExtremes"),
  volcano: createPingIcon("bg-fuchsia-500", "volcanoes"),
  water: createPingIcon("bg-green-500", "waterColor"),
  default: createPingIcon("bg-primary", "default"),
};

const getIconFactory = (categoryId: string) => {
  switch (categoryId) {
    case "drought":
      return ICONS.drought;
    case "dustHaze":
      return ICONS.dust;
    case "wildfires":
      return ICONS.wildfire;
    case "floods":
      return ICONS.flood;
    case "severeStorms":
      return ICONS.storm;
    case "volcanoes":
      return ICONS.volcano;
    case "waterColor":
      return ICONS.water;
    case "landslides":
      return ICONS.landslide;
    case "seaLakeIce":
      return ICONS.ice;
    case "earthquakes":
      return ICONS.earthquake;
    case "snow":
      return ICONS.snow;
    case "tempExtremes":
      return ICONS.temperature;
    case "manmade":
      return ICONS.manmade;
    default:
      return ICONS.default;
  }
};

const getPolygonColor = (categoryId: string) => {
  switch (categoryId) {
    case "drought":
      return "oklch(85.2% 0.199 91.936)";
    case "dustHaze":
      return "oklch(54.7% 0.021 43.1)";
    case "wildfires":
      return "oklch(63.7% 0.237 25.331)";
    case "floods":
      return "oklch(62.3% 0.214 259.815)";
    case "severeStorms":
      return "oklch(58.5% 0.233 277.117)";
    case "volcanoes":
      return "oklch(66.7% 0.295 322.15)";
    case "waterColor":
      return "oklch(72.3% 0.219 149.579)";
    case "landslides":
      return "oklch(71.2% 0.194 13.428)";
    case "seaLakeIce":
      return "oklch(71.5% 0.143 215.221)";
    case "earthquakes":
      return "oklch(44.6% 0.043 257.281)";
    case "snow":
      return "oklch(86.9% 0.022 252.894)";
    case "tempExtremes":
      return "oklch(55.3% 0.195 38.402)";
    case "manmade":
      return "oklch(76.8% 0.233 130.85)";
    default:
      return "var(--primary)";
  }
};

const getClusterBgClass = (categoryId: string) => {
  switch (categoryId) {
    case "drought":
      return "bg-yellow-500/80";
    case "dustHaze":
      return "bg-taupe-500/80";
    case "wildfires":
      return "bg-red-500/80";
    case "floods":
      return "bg-blue-600/80";
    case "severeStorms":
      return "bg-indigo-500/80";
    case "volcanoes":
      return "bg-fuchsia-500/80";
    case "waterColor":
      return "bg-green-500/80";
    case "landslides":
      return "bg-rose-400/80";
    case "seaLakeIce":
      return "bg-cyan-400/80";
    case "earthquakes":
      return "bg-slate-600/80";
    case "snow":
      return "bg-slate-300/80";
    case "tempExtremes":
      return "bg-orange-700/80";
    case "manmade":
      return "bg-lime-500/80";
    default:
      return "bg-primary/80";
  }
};

interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: string;
}

/**
 * Converts decimal degrees to DMS format with direction.
 * @param decimal - The coordinate in decimal degrees.
 * @param type - 'lat' for Latitude, 'lng' for Longitude.
 */

function convertDecimalToDMS(decimal: number, type: "lat" | "lng"): DMS {
  const absoluteValue = Math.abs(decimal);

  const degrees = Math.floor(absoluteValue);
  const minutesRemainder = (absoluteValue - degrees) * 60;

  const minutes = Math.floor(minutesRemainder);
  const seconds = (minutesRemainder - minutes) * 60;

  let direction = "";
  if (type === "lat") {
    direction = decimal >= 0 ? "N" : "S";
  } else {
    direction = decimal >= 0 ? "E" : "W";
  }

  return {
    degrees,
    minutes,
    seconds: parseFloat(seconds.toFixed(2)),
    direction,
  };
}

export default Map;
