export interface PointGeometry {
  date: string;
  type: "Point";
  coordinates: [number, number];
}

export interface PolygonGeometry {
  date: string;
  type: "Polygon";
  coordinates: [number, number][][];
}

export type EonetGeometry = PointGeometry | PolygonGeometry;

export interface EonetCategory {
  id: number;
  title: string;
}

export interface EonetSource {
  id: string;
  url: string;
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometries: EonetGeometry[];
  closed: string | null;
}

export interface EonetResponse {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
}
