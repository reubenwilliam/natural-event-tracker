"use client";

import Chain from "@/assets/icons/chain";
import Minus from "@/assets/icons/minus";
import Plus from "@/assets/icons/plus";
import { EonetEvent } from "@/types/eonet";
import { format } from "date-fns";
import L, { LatLngBoundsExpression, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
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

function CustomZoomControl() {
  const map = useMap();

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
      className="absolute bottom-18 inset-x-4 z-1000 flex items-end justify-between gap-0.5 pointer-events-none"
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <Button
        variant="outline"
        className="text-[11px] pointer-events-auto font-heading uppercase tracking-widest"
        onClick={(e) => {
          e.stopPropagation();
          reset();
        }}
      >
        <span>RESET</span>
      </Button>
      <div className="flex flex-col gap-0.5 pointer-events-auto">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
        >
          <Plus className="size-3" />
        </Button>
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
        >
          <Minus className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function ClosePopupModal() {
  const map = useMap();

  const handleClose = () => {
    map.closePopup();
  };

  return (
    <Button
      variant="ghost"
      className="rounded-none p-1 h-6"
      onClick={handleClose}
    >
      <X className="size-3.5" />
    </Button>
  );
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

const Map = ({ events }: MapProps) => {
  const { resolvedTheme } = useTheme();

  const tileUrl =
    resolvedTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCustomClusterIcon = (cluster: any) => {
    const markers = cluster.getAllChildMarkers();
    const count = cluster.getChildCount();

    const counts: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markers.forEach((marker: any) => {
      const id = marker.options.icon.options.categoryId;
      if (id) {
        counts[id] = (counts[0] || 0) + 1;
      }
    });

    let dominantId = "15";
    let maxCount = 0;
    Object.entries(counts).forEach(([id, c]) => {
      if (c > maxCount) {
        maxCount = c;
        dominantId = id;
      }
    });

    const bgColor = getClusterBgClass(Number(dominantId));

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
      style={{ backgroundColor: "var(--background)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={tileUrl}
      />
      <MapEventsComponent />
      <CustomZoomControl />
      <CustomAttribution position="bottomright" />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createCustomClusterIcon}
      >
        {events?.map((event) => {
          const latestGeometry = event.geometries[event.geometries.length - 1];
          const categoryId = event.categories[0]?.id;

          if (latestGeometry.type === "Polygon") {
            const polygonCoords = latestGeometry.coordinates[0].map(
              (coordPair) => [coordPair[1], coordPair[0]] as [number, number],
            );
            const eventColor = getPolygonColor(categoryId);

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
              ></Polygon>
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
                icon={getIconFactory(categoryId)}
              >
                <Popup className="theme-popup" closeButton={false}>
                  <div className="flex flex-col min-w-50 w-75">
                    <div className="flex flex-col p-2">
                      <div className="flex justify-between items-center mb-2">
                        <div
                          className={`${getClusterBgClass(categoryId)} p-0.5 uppercase font-number text-[10px]`}
                        >
                          <span className="text-current">
                            {event.categories[0]?.title}
                          </span>
                        </div>
                        <ClosePopupModal />
                      </div>
                      <div className="flex flex-col gap-2 font-number">
                        <h3 className="text-[11px] font-semibold text-primary">
                          {event.title}
                        </h3>
                        <span className="text-[10px] font-mono">
                          {event.description}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                        <span className="text-[9px] text-muted-foreground font-number">
                          {format(new Date(latestGeometry.date), "PPP")}
                        </span>
                        <Link
                          href={event.sources[0].url}
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
              </Marker>
            );
          }
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

const createPingIcon = (colorClass: string, categoryId: number) => {
  return L.divIcon({
    className: "",
    html: `<span class="relative flex h-6 w-6 items-center justify-center">
        <span class="absolute inline-flex h-full w-full animate-ping animation-duration-[3s] rounded-full ${colorClass} opacity-75"></span>
        <span class="relative inline-flex h-3 w-3 rounded-full ${colorClass}"></span>
      </span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    categoryId: categoryId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

const ICONS = {
  drought: createPingIcon("bg-yellow-500", 6),
  wildfire: createPingIcon("bg-red-500", 8),
  dust: createPingIcon("bg-taupe-500", 7),
  earthquake: createPingIcon("bg-zinc-500", 16),
  flood: createPingIcon("bg-blue-500", 9),
  landslide: createPingIcon("bg-stone-600", 14),
  manmade: createPingIcon("bg-lime-500", 19),
  ice: createPingIcon("bg-cyan-500", 15),
  storm: createPingIcon("bg-indigo-500", 10),
  snow: createPingIcon("bg-slate-300", 17),
  temperature: createPingIcon("bg-orange-500", 18),
  volcano: createPingIcon("bg-amber-500", 12),
  water: createPingIcon("bg-sky-500", 13),
  default: createPingIcon("bg-primary", 0),
};

const getIconFactory = (categoryId: number) => {
  switch (categoryId) {
    case 6:
      return ICONS.drought;
    case 7:
      return ICONS.dust;
    case 8:
      return ICONS.wildfire;
    case 9:
      return ICONS.flood;
    case 10:
      return ICONS.storm;
    case 12:
      return ICONS.volcano;
    case 13:
      return ICONS.water;
    case 14:
      return ICONS.landslide;
    case 15:
      return ICONS.ice;
    case 16:
      return ICONS.earthquake;
    case 17:
      return ICONS.snow;
    case 18:
      return ICONS.temperature;
    case 19:
      return ICONS.manmade;
    default:
      return ICONS.default;
  }
};

const getPolygonColor = (categoryId: number) => {
  switch (categoryId) {
    case 6:
      return "oklch(85.2% 0.199 91.936)";
    case 7:
      return "oklch(54.7% 0.021 43.1)";
    case 8:
      return "oklch(63.7% 0.237 25.331)";
    case 9:
      return "oklch(62.3% 0.214 259.815)";
    case 10:
      return "oklch(58.5% 0.233 277.117)";
    case 12:
      return "oklch(76.9% 0.188 70.08)";
    case 13:
      return "oklch(68.5% 0.169 237.323)";
    case 14:
      return "oklch(44.4% 0.011 73.639)";
    case 15:
      return "oklch(71.5% 0.143 215.221)";
    case 16:
      return "oklch(55.2% 0.016 285.938)";
    case 17:
      return "oklch(86.9% 0.022 252.894)";
    case 18:
      return "oklch(70.5% 0.213 47.604)";
    case 19:
      return "oklch(76.8% 0.233 130.85)";
    default:
      return "var(--primary)";
  }
};

const getClusterBgClass = (categoryId: number) => {
  switch (categoryId) {
    case 6:
      return "bg-yellow-500/80";
    case 7:
      return "bg-taupe-500/80";
    case 8:
      return "bg-red-500/80";
    case 9:
      return "bg-blue-600/80";
    case 10:
      return "bg-indigo-500/80";
    case 12:
      return "bg-orange-500/80";
    case 13:
      return "bg-sky-500/80";
    case 14:
      return "bg-stone-600/80";
    case 15:
      return "bg-cyan-400/80";
    case 16:
      return "bg-zinc-500/80";
    case 17:
      return "bg-slate-300/80";
    case 18:
      return "bg-orange-500/80";
    case 19:
      return "bg-lime-500/80";
    default:
      return "bg-primary/80";
  }
};

export default Map;
