import * as turf from "@turf/turf";
import type { FeatureCollection, Feature, Geometry, Point, Polygon, LineString } from "geojson";
import type { GISLayer, ElevationPoint, MeasurementResult, SymbologyType } from "../types/gis";

/**
 * Creates a Buffer zone around all features in a FeatureCollection
 */
export function generateBufferLayer(
  sourceLayer: GISLayer,
  distanceValue: number,
  unit: "meters" | "kilometers" | "miles"
): GISLayer {
  const bufferedFeatures: Feature[] = [];

  sourceLayer.data.features.forEach((feature, idx) => {
    try {
      const buffered = turf.buffer(feature as any, distanceValue, { units: unit });
      if (buffered) {
        buffered.properties = {
          ...feature.properties,
          buffer_distance: `${distanceValue} ${unit}`,
          source_layer: sourceLayer.name,
          source_feature_id: feature.id || idx
        };
        bufferedFeatures.push(buffered as Feature);
      }
    } catch (e) {
      console.warn("Buffer calculation error on feature", idx, e);
    }
  });

  const fc: FeatureCollection = {
    type: "FeatureCollection",
    features: bufferedFeatures
  };

  return {
    id: `buffer_${Date.now()}`,
    name: `Buffer (${distanceValue} ${unit}) - ${sourceLayer.name}`,
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.6,
    featureCount: bufferedFeatures.length,
    createdAt: new Date().toISOString(),
    category: "Spatial Geoprocessing",
    style: {
      color: "#2563eb",
      fillColor: "#3b82f6",
      fillOpacity: 0.35,
      weight: 2,
      pointRadius: 5,
      symbologyType: "single",
      showLabels: false
    },
    data: fc
  };
}

/**
 * Generates Voronoi Polygons from Point features
 */
export function generateVoronoiLayer(sourceLayer: GISLayer): GISLayer | null {
  const points = sourceLayer.data.features.filter(
    (f) => f.geometry && (f.geometry.type === "Point" || f.geometry.type === "MultiPoint")
  );

  if (points.length < 2) {
    throw new Error("Voronoi diagram requires at least 2 point features.");
  }

  const pointFC: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: points as Feature<Point>[]
  };

  const bbox = turf.bbox(pointFC);
  // Expand bbox slightly
  const expandedBbox: [number, number, number, number] = [
    bbox[0] - 0.05,
    bbox[1] - 0.05,
    bbox[2] + 0.05,
    bbox[3] + 0.05
  ];

  const voronoiPolygons = turf.voronoi(pointFC, { bbox: expandedBbox });

  if (!voronoiPolygons || !voronoiPolygons.features) {
    throw new Error("Failed to construct Voronoi spatial polygons.");
  }

  // Attach point properties to corresponding voronoi cells
  voronoiPolygons.features.forEach((poly, idx) => {
    if (poly && points[idx]) {
      poly.properties = {
        ...points[idx].properties,
        cell_index: idx,
        source_point_id: points[idx].id || idx
      };
    }
  });

  const validFeatures = voronoiPolygons.features.filter(Boolean) as Feature[];

  return {
    id: `voronoi_${Date.now()}`,
    name: `Voronoi Tessellation - ${sourceLayer.name}`,
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.5,
    featureCount: validFeatures.length,
    createdAt: new Date().toISOString(),
    category: "Spatial Analysis",
    style: {
      color: "#8b5cf6",
      fillColor: "#a855f7",
      fillOpacity: 0.3,
      weight: 2,
      pointRadius: 5,
      symbologyType: "single",
      showLabels: true,
      labelField: "hospital_name"
    },
    data: {
      type: "FeatureCollection",
      features: validFeatures
    }
  };
}

/**
 * Calculates Centroids for polygons or line strings
 */
export function generateCentroidLayer(sourceLayer: GISLayer): GISLayer {
  const centroids: Feature[] = [];

  sourceLayer.data.features.forEach((feature, idx) => {
    try {
      const centroid = turf.centroid(feature as any);
      centroid.properties = {
        ...feature.properties,
        centroid_of: sourceLayer.name,
        original_geometry_type: feature.geometry.type
      };
      centroids.push(centroid);
    } catch (e) {
      console.warn("Centroid error", idx, e);
    }
  });

  return {
    id: `centroid_${Date.now()}`,
    name: `Centroids - ${sourceLayer.name}`,
    type: "vector",
    geometryType: "Point",
    visible: true,
    opacity: 0.9,
    featureCount: centroids.length,
    createdAt: new Date().toISOString(),
    category: "Geoprocessing",
    style: {
      color: "#10b981",
      fillColor: "#34d399",
      fillOpacity: 0.9,
      weight: 2,
      pointRadius: 7,
      symbologyType: "single"
    },
    data: {
      type: "FeatureCollection",
      features: centroids
    }
  };
}

/**
 * Calculates Bounding Box polygon layer
 */
export function generateBBoxLayer(sourceLayer: GISLayer): GISLayer {
  const bbox = turf.bbox(sourceLayer.data);
  const bboxPolygon = turf.bboxPolygon(bbox);
  bboxPolygon.properties = {
    layer_name: sourceLayer.name,
    min_lng: bbox[0],
    min_lat: bbox[1],
    max_lng: bbox[2],
    max_lat: bbox[3],
    area_sqkm: Math.round(turf.area(bboxPolygon) / 1000000 * 100) / 100
  };

  return {
    id: `bbox_${Date.now()}`,
    name: `Bounding Box - ${sourceLayer.name}`,
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.7,
    featureCount: 1,
    createdAt: new Date().toISOString(),
    category: "Geoprocessing",
    style: {
      color: "#f43f5e",
      fillColor: "transparent",
      fillOpacity: 0,
      weight: 3,
      dashArray: "6,6",
      pointRadius: 5,
      symbologyType: "single"
    },
    data: {
      type: "FeatureCollection",
      features: [bboxPolygon]
    }
  };
}

/**
 * Performs Point-In-Polygon Spatial Join
 * Counts points inside each polygon and sums numeric field
 */
export function performSpatialJoin(
  pointsLayer: GISLayer,
  polygonsLayer: GISLayer,
  numericFieldToSum?: string
): GISLayer {
  const points = pointsLayer.data.features.filter(
    (f) => f.geometry && (f.geometry.type === "Point" || f.geometry.type === "MultiPoint")
  );

  const joinedPolygons = polygonsLayer.data.features.map((poly) => {
    const polyFeature = poly as Feature<Polygon>;
    let count = 0;
    let sumValue = 0;

    points.forEach((pt) => {
      try {
        if (turf.booleanPointInPolygon(pt as Feature<Point>, polyFeature)) {
          count++;
          if (numericFieldToSum && typeof pt.properties?.[numericFieldToSum] === "number") {
            sumValue += pt.properties[numericFieldToSum];
          }
        }
      } catch (e) {
        // ignore geometry errors
      }
    });

    const updatedProps = {
      ...poly.properties,
      joined_points_count: count
    };

    if (numericFieldToSum) {
      updatedProps[`sum_${numericFieldToSum}`] = Math.round(sumValue * 100) / 100;
    }

    return {
      ...poly,
      properties: updatedProps
    };
  });

  return {
    id: `spatial_join_${Date.now()}`,
    name: `Spatial Join (${pointsLayer.name} in ${polygonsLayer.name})`,
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.75,
    featureCount: joinedPolygons.length,
    createdAt: new Date().toISOString(),
    category: "Spatial Join",
    style: {
      color: "#0284c7",
      fillColor: "#38bdf8",
      fillOpacity: 0.5,
      weight: 2,
      pointRadius: 5,
      symbologyType: "choropleth",
      targetField: "joined_points_count",
      colorScheme: ["#e0f2fe", "#38bdf8", "#0284c7", "#0369a1"],
      showLabels: true,
      labelField: "joined_points_count"
    },
    data: {
      type: "FeatureCollection",
      features: joinedPolygons
    }
  };
}

/**
 * Interactive Measurement helper
 */
export function calculateMeasurement(coordinates: [number, number][], mode: "distance" | "area"): MeasurementResult {
  if (mode === "distance") {
    if (coordinates.length < 2) {
      return { type: "distance", value: 0, unit: "m", formatted: "0 m", coordinates };
    }
    const line = turf.lineString(coordinates.map((c) => [c[1], c[0]])); // Leaflet [lat, lng] to Turf [lng, lat]
    const lengthKm = turf.length(line, { units: "kilometers" });
    if (lengthKm >= 1) {
      return {
        type: "distance",
        value: lengthKm,
        unit: "km",
        formatted: `${lengthKm.toFixed(2)} km`,
        coordinates
      };
    } else {
      const lengthMeters = lengthKm * 1000;
      return {
        type: "distance",
        value: lengthMeters,
        unit: "m",
        formatted: `${Math.round(lengthMeters)} m`,
        coordinates
      };
    }
  } else {
    // Area mode
    if (coordinates.length < 3) {
      return { type: "area", value: 0, unit: "m²", formatted: "0 m²", coordinates };
    }
    // Ensure polygon is closed
    const closedCoords = [...coordinates];
    if (
      closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
      closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
    ) {
      closedCoords.push(closedCoords[0]);
    }
    const polygon = turf.polygon([closedCoords.map((c) => [c[1], c[0]])]);
    const areaSqMeters = turf.area(polygon);

    if (areaSqMeters >= 1000000) {
      const areaSqKm = areaSqMeters / 1000000;
      return {
        type: "area",
        value: areaSqKm,
        unit: "km²",
        formatted: `${areaSqKm.toFixed(2)} km²`,
        coordinates
      };
    } else if (areaSqMeters >= 10000) {
      const hectares = areaSqMeters / 10000;
      return {
        type: "area",
        value: hectares,
        unit: "ha",
        formatted: `${hectares.toFixed(2)} ha`,
        coordinates
      };
    } else {
      return {
        type: "area",
        value: areaSqMeters,
        unit: "m²",
        formatted: `${Math.round(areaSqMeters)} m²`,
        coordinates
      };
    }
  }
}

/**
 * Generates Elevation profile data along a path
 */
export function generateElevationProfile(lineCoords: [number, number][]): ElevationPoint[] {
  if (lineCoords.length < 2) return [];

  // Convert Leaflet [lat, lng] to Turf [lng, lat]
  const turfLine = turf.lineString(lineCoords.map((c) => [c[1], c[0]]));
  const totalKm = turf.length(turfLine, { units: "kilometers" });

  const steps = 30;
  const profile: ElevationPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const distanceKm = (totalKm * i) / steps;
    const point = turf.along(turfLine, distanceKm, { units: "kilometers" });
    const [lng, lat] = point.geometry.coordinates;

    // Realistic elevation simulation based on topography coordinates (e.g. SF hills 10m to 280m)
    const baseElev = Math.abs(Math.sin(lat * 100 + lng * 50)) * 180 + Math.abs(Math.cos(lng * 120)) * 90 + 12;
    const noise = Math.sin(i * 0.8) * 15;
    const elev = Math.max(2, Math.round(baseElev + noise));

    profile.push({
      distanceKm: Math.round(distanceKm * 100) / 100,
      elevationMeters: elev,
      lat,
      lng
    });
  }

  return profile;
}

/**
 * Color Scheme helper for Choropleth maps
 */
export function getChoroplethColor(
  value: number,
  minVal: number,
  maxVal: number,
  colorRamp: string[] = ["#fef08a", "#f97316", "#dc2626"]
): string {
  if (isNaN(value) || minVal === maxVal) return colorRamp[0];
  const normalized = Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal || 1)));
  const index = Math.min(colorRamp.length - 1, Math.floor(normalized * colorRamp.length));
  return colorRamp[index];
}

/**
 * Categorized Color helper for Discrete/Categorical fields
 */
const CATEGORY_PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#64748b"
];

export function getCategorizedColor(val: string | number, categoryMap: Map<string, string>): string {
  const strVal = String(val);
  if (categoryMap.has(strVal)) {
    return categoryMap.get(strVal)!;
  }
  const nextColor = CATEGORY_PALETTE[categoryMap.size % CATEGORY_PALETTE.length];
  categoryMap.set(strVal, nextColor);
  return nextColor;
}

/**
 * GeoJSON Exporter
 */
export function downloadGeoJSON(layer: GISLayer) {
  const jsonString = JSON.stringify(layer.data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${layer.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Attribute CSV Exporter
 */
export function downloadAttributeCSV(layer: GISLayer) {
  if (!layer.data.features.length) return;

  const sampleProps = layer.data.features[0].properties || {};
  const headers = Object.keys(sampleProps);

  let csvContent = headers.join(",") + "\n";

  layer.data.features.forEach((feat) => {
    const props = feat.properties || {};
    const row = headers.map((h) => {
      const val = props[h] !== undefined ? props[h] : "";
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${layer.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_attributes.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
