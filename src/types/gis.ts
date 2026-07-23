import type { FeatureCollection, Feature, Geometry } from "geojson";

export type SpatialToolMode =
  | "select"
  | "pan"
  | "measure_distance"
  | "measure_area"
  | "draw_point"
  | "draw_line"
  | "draw_polygon"
  | "buffer"
  | "voronoi"
  | "elevation_profile"
  | "identify"
  | "boundary_redraw";

export type BasemapType =
  | "carto_dark"
  | "carto_light"
  | "osm"
  | "esri_satellite"
  | "opentopo";

export type SymbologyType = "single" | "choropleth" | "categorized";

export interface LayerStyle {
  color: string; // Stroke or point outline
  fillColor: string; // Polygon fill or point interior
  fillOpacity: number;
  weight: number; // Stroke thickness
  dashArray?: string;
  pointRadius: number;
  symbologyType: SymbologyType;
  // Choropleth & Categorized settings
  targetField?: string;
  colorScheme?: string[]; // Array of hex colors for choropleth scale
  showLabels?: boolean;
  labelField?: string;
  labelColor?: string;
}

export interface GISLayer {
  id: string;
  name: string;
  type: "vector" | "raster";
  geometryType?: "Point" | "LineString" | "Polygon" | "MultiPolygon" | "Mixed";
  visible: boolean;
  opacity: number;
  data: FeatureCollection;
  style: LayerStyle;
  featureCount: number;
  createdAt: string;
  category?: string;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
  zoom: number;
  utmZone?: string;
}

export interface MeasurementResult {
  type: "distance" | "area";
  value: number; // in meters or sq meters
  unit: string; // "m", "km", "m²", "km²", "ha", "acres"
  formatted: string;
  coordinates: [number, number][];
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  lat: number;
  lng: number;
}

export interface SpatialAnalysisOutput {
  id: string;
  toolName: string;
  executionTime: string;
  layerResult: GISLayer;
  summaryMetrics: {
    label: string;
    value: string | number;
  }[];
}

export interface AIAnalysisResponse {
  explanation: string;
  recommendedTools?: string[];
  layerName?: string;
  geojson?: FeatureCollection | null;
}
