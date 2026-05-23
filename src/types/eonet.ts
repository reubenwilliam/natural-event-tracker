export const API_URL = "https://eonet.gsfc.nasa.gov/api/v3";

export interface PointGeometry {
  date: string;
  type: "Point";
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  coordinates: [number, number];
}

export interface PolygonGeometry {
  date: string;
  type: "Polygon";
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  coordinates: [number, number][][];
}

export type EonetGeometry = PointGeometry | PolygonGeometry;

export interface EonetCategory {
  id: string;
  title: string;
  description: string;
}

export interface EonetSource {
  id: string;
  title: string;
  source: string;
  url: string;
}

export interface EonetMagnitude {
  id: string;
  name: string;
  unit: string;
  description: string;
  link: string;
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
  closed: string | null;
}

export interface EonetResponse {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
}

export const STATUS_VALUES = ["all", "open", "closed"];
