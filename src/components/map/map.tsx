"use client";

import L, { Icon, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Button } from "../ui/button";
import Plus from "@/assets/icons/plus";
import Minus from "@/assets/icons/minus";
import { createPortal } from "react-dom";

const MIN_ZOOM = 2;
const CENTER = [0, 0] as [number, number];

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
    map.flyTo(CENTER, MIN_ZOOM);
  };

  return (
    <div
      className="absolute bottom-18 inset-x-4 z-1000 flex items-end justify-between gap-0.5"
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <Button
        variant="outline"
        className="text-[11px] font-heading uppercase tracking-widest"
        onClick={(e) => {
          e.stopPropagation();
          reset();
        }}
      >
        <span>RESET</span>
      </Button>
      <div className="flex flex-col gap-0.5">
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

const Map = () => {
  const { resolvedTheme } = useTheme();

  const tileUrl =
    resolvedTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

  const geometries = [
    {
      date: "2026-05-06T00:00:00Z",
      type: "Point",
      coordinates: [147.5, 7.6],
    },
    {
      date: "2026-05-06T06:00:00Z",
      type: "Point",
      coordinates: [146.9, 7.4],
    },
    {
      date: "2026-05-06T12:00:00Z",
      type: "Point",
      coordinates: [145.7, 7.1],
    },
    {
      date: "2026-05-06T18:00:00Z",
      type: "Point",
      coordinates: [144.7, 7.3],
    },
    {
      date: "2026-05-07T00:00:00Z",
      type: "Point",
      coordinates: [143.8, 7.2],
    },
    {
      date: "2026-05-07T06:00:00Z",
      type: "Point",
      coordinates: [142.9, 7.5],
    },
    {
      date: "2026-05-07T12:00:00Z",
      type: "Point",
      coordinates: [142.2, 7.7],
    },
    {
      date: "2026-05-07T18:00:00Z",
      type: "Point",
      coordinates: [141.2, 8.1],
    },
    {
      date: "2026-05-08T00:00:00Z",
      type: "Point",
      coordinates: [139.9, 8.4],
    },
  ];

  const customIcon = new Icon({
    iconUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMTY2MzAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tYXAtcGluLWljb24gbHVjaWRlLW1hcC1waW4iPjxwYXRoIGQ9Ik0yMCAxMGMwIDQuOTkzLTUuNTM5IDEwLjE5My03LjM5OSAxMS43OTlhMSAxIDAgMCAxLTEuMjAyIDBDOS41MzkgMjAuMTkzIDQgMTQuOTkzIDQgMTBhOCA4IDAgMCAxIDE2IDAiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+",
    iconSize: [20, 20],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCustomClusterIcon = (cluster: any) => {
    return L.divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster",
      iconSize: point(33, 33, true),
    });
  };

  return (
    <MapContainer
      center={CENTER}
      zoom={MIN_ZOOM}
      minZoom={MIN_ZOOM}
      className="h-full w-full z-0"
      attributionControl={false}
      zoomControl={false}
      worldCopyJump={true}
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
        {geometries.map((geometry, index) => (
          <Marker
            key={index}
            position={[...geometry.coordinates].reverse() as [number, number]}
            icon={customIcon}
          >
            <Popup>This is an event</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
