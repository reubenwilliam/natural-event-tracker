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

function MapControls() {
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
          >
            <Minus className="size-3" />
          </Button>
        </div>
        <div className="flex items-center gap-1 ">
          <Button
            variant="outline"
            className="text-[11px] font-heading uppercase tracking-widest pointer-events-auto"
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

    let dominantId = "";
    let maxCount = 0;
    Object.entries(counts).forEach(([id, c]) => {
      if (c > maxCount) {
        maxCount = c;
        dominantId = id;
      }
    });

    const bgColor = getClusterBgClass(dominantId);

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
      <MapControls />
      <CustomAttribution position="bottomright" />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createCustomClusterIcon}
      >
        {events?.map((event) => {
          const latestGeometry = event.geometry[event.geometry.length - 1];
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
            const latDmsCoord = convertDecimalToDMS(
              latestGeometry.coordinates[1],
              "lat",
            );
            const lngDmsCoord = convertDecimalToDMS(
              latestGeometry.coordinates[0],
              "lng",
            );

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
                        {event.description && (
                          <span className="text-[9px] font-mono">
                            {event.description}
                          </span>
                        )}
                        {latestGeometry.magnitudeValue && (
                          <span className="text-[9px] font-number">
                            <span className="text-muted-foreground">
                              Magnitude:{" "}
                            </span>
                            {latestGeometry.magnitudeValue}{" "}
                            {latestGeometry.magnitudeUnit}
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

const createPingIcon = (colorClass: string, categoryId: string) => {
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
