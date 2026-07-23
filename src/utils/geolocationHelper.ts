import type { GISLayer } from "../types/gis";

// Default reference coordinates for initial sample data (Victoria Island, Lagos, Nigeria)
const DEFAULT_REF_LAT = 6.4281;
const DEFAULT_REF_LNG = 3.4219;

/**
 * Shifts GeoJSON features in layers so that they are centered around targetLat, targetLng
 */
export function relocateLayersToCoordinates(
  layers: GISLayer[],
  targetLat: number,
  targetLng: number,
  sourceRefLat: number = DEFAULT_REF_LAT,
  sourceRefLng: number = DEFAULT_REF_LNG
): GISLayer[] {
  const dLat = targetLat - sourceRefLat;
  const dLng = targetLng - sourceRefLng;

  if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) {
    return layers;
  }

  const shiftCoordinates = (coords: any, geomType: string): any => {
    if (geomType === "Point") {
      // [lng, lat]
      return [coords[0] + dLng, coords[1] + dLat];
    }
    if (geomType === "LineString" || geomType === "MultiPoint") {
      // [[lng, lat], ...]
      return coords.map((pt: [number, number]) => [pt[0] + dLng, pt[1] + dLat]);
    }
    if (geomType === "Polygon" || geomType === "MultiLineString") {
      // [[[lng, lat], ...]]
      return coords.map((ring: [number, number][]) =>
        ring.map((pt: [number, number]) => [pt[0] + dLng, pt[1] + dLat])
      );
    }
    if (geomType === "MultiPolygon") {
      // [[[[lng, lat], ...]]]
      return coords.map((poly: [number, number][][]) =>
        poly.map((ring: [number, number][]) =>
          ring.map((pt: [number, number]) => [pt[0] + dLng, pt[1] + dLat])
        )
      );
    }
    return coords;
  };

  return layers.map((layer) => {
    const newFeatures = layer.data.features.map((feature) => {
      if (!feature.geometry || feature.geometry.type === "GeometryCollection") {
        return feature;
      }

      const geom = feature.geometry as any;
      const gType = geom.type;
      const newGeomCoords = shiftCoordinates(geom.coordinates, gType);

      return {
        ...feature,
        geometry: {
          ...geom,
          coordinates: newGeomCoords
        }
      };
    });

    return {
      ...layer,
      data: {
        ...layer.data,
        features: newFeatures
      }
    };
  });
}

/**
 * Utility to construct a User Location Marker Layer
 */
export function createUserLocationLayer(lat: number, lng: number): GISLayer {
  return {
    id: "layer_user_current_location",
    name: "📍 My Live Current Location",
    type: "vector",
    geometryType: "Point",
    visible: true,
    opacity: 1.0,
    featureCount: 1,
    createdAt: new Date().toISOString(),
    category: "User Location",
    style: {
      color: "#38bdf8",
      fillColor: "#0284c7",
      fillOpacity: 0.9,
      weight: 3,
      pointRadius: 10,
      symbologyType: "single",
      showLabels: true,
      labelField: "title",
      labelColor: "#38bdf8"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "user_loc_pin",
          geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          properties: {
            title: "Your Physical Location (User Center)",
            lat: lat.toFixed(5),
            lng: lng.toFixed(5),
            status: "GPS Active",
            timestamp: new Date().toLocaleTimeString()
          }
        }
      ]
    }
  };
}
