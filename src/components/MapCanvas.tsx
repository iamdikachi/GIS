import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type {
  GISLayer,
  BasemapType,
  SpatialToolMode,
  MapCoordinates,
  MeasurementResult
} from "../types/gis";
import {
  getChoroplethColor,
  getCategorizedColor,
  calculateMeasurement
} from "../utils/gisEngine";

interface MapCanvasProps {
  layers: GISLayer[];
  selectedBasemap: BasemapType;
  activeTool: SpatialToolMode;
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string | null, layerId: string | null) => void;
  onAddUserFeature?: (feature: any) => void;
  onCoordinatesChange: (coords: MapCoordinates) => void;
  onMeasurementChange?: (measurement: MeasurementResult | null) => void;
  onLineDrawnForElevation?: (coords: [number, number][]) => void;
  centerCoordinates?: MapCoordinates;
  onLocateUser?: () => void;
  isLocating?: boolean;
}

const BASEMAP_URLS: Record<BasemapType, { url: string; attribution: string }> = {
  carto_dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  carto_light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  esri_satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  },
  opentopo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  }
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  layers,
  selectedBasemap,
  activeTool,
  selectedFeatureId,
  onSelectFeature,
  onAddUserFeature,
  onCoordinatesChange,
  onMeasurementChange,
  onLineDrawnForElevation,
  centerCoordinates,
  onLocateUser,
  isLocating = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayersRef = useRef<Map<string, L.GeoJSON>>(new Map());
  const measureLayerRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);

  // Drawing & Measurement transient state
  const [measureCoords, setMeasureCoords] = useState<[number, number][]>([]);

  // Fly to target coordinates when centerCoordinates prop updates
  useEffect(() => {
    if (!mapRef.current || !centerCoordinates) return;
    mapRef.current.flyTo([centerCoordinates.lat, centerCoordinates.lng], centerCoordinates.zoom || 15, {
      duration: 1.2
    });
  }, [centerCoordinates?.lat, centerCoordinates?.lng, centerCoordinates?.zoom]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on San Francisco Bay Area [37.7749, -122.4194]
    const map = L.map(mapContainerRef.current, {
      center: [37.768, -122.432],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: "topright" }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

    // Initial Basemap
    const basemapCfg = BASEMAP_URLS[selectedBasemap];
    const tileLayer = L.tileLayer(basemapCfg.url, {
      attribution: basemapCfg.attribution,
      maxZoom: 19
    }).addTo(map);
    basemapLayerRef.current = tileLayer;

    // Measurement layer group
    const measureGrp = L.layerGroup().addTo(map);
    measureLayerRef.current = measureGrp;

    // Drawing layer group
    const drawGrp = L.layerGroup().addTo(map);
    drawingLayerRef.current = drawGrp;

    // Coordinate mouse tracking
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      onCoordinatesChange({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
        zoom: map.getZoom()
      });
    });

    map.on("zoomend", () => {
      const center = map.getCenter();
      onCoordinatesChange({
        lat: Number(center.lat.toFixed(5)),
        lng: Number(center.lng.toFixed(5)),
        zoom: map.getZoom()
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    if (!mapRef.current || !basemapLayerRef.current) return;
    const basemapCfg = BASEMAP_URLS[selectedBasemap];
    basemapLayerRef.current.setUrl(basemapCfg.url);
  }, [selectedBasemap]);

  // Render & Synchronize GIS Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove layers no longer in prop list
    const currentLayerIds = new Set(layers.map((l) => l.id));
    geojsonLayersRef.current.forEach((leafletGeoJson, layerId) => {
      if (!currentLayerIds.has(layerId)) {
        map.removeLayer(leafletGeoJson);
        geojsonLayersRef.current.delete(layerId);
      }
    });

    // Render / update each GIS layer
    layers.forEach((layer) => {
      if (!layer.visible) {
        if (geojsonLayersRef.current.has(layer.id)) {
          map.removeLayer(geojsonLayersRef.current.get(layer.id)!);
          geojsonLayersRef.current.delete(layer.id);
        }
        return;
      }

      // Compute min/max for choropleth or categories map
      const categoryMap = new Map<string, string>();
      let minVal = Infinity;
      let maxVal = -Infinity;

      if (layer.style.symbologyType === "choropleth" && layer.style.targetField) {
        layer.data.features.forEach((feat) => {
          const v = feat.properties?.[layer.style.targetField!];
          if (typeof v === "number") {
            if (v < minVal) minVal = v;
            if (v > maxVal) maxVal = v;
          }
        });
      }

      // Existing leaflet layer check
      if (geojsonLayersRef.current.has(layer.id)) {
        map.removeLayer(geojsonLayersRef.current.get(layer.id)!);
      }

      const leafletGeoJson = L.geoJSON(layer.data, {
        pointToLayer: (feature, latlng) => {
          let fillColor = layer.style.fillColor;

          if (layer.style.symbologyType === "choropleth" && layer.style.targetField) {
            const val = feature.properties?.[layer.style.targetField];
            fillColor = getChoroplethColor(val, minVal, maxVal, layer.style.colorScheme);
          } else if (layer.style.symbologyType === "categorized" && layer.style.targetField) {
            const val = feature.properties?.[layer.style.targetField];
            fillColor = getCategorizedColor(val, categoryMap);
          }

          const marker = L.circleMarker(latlng, {
            radius: layer.style.pointRadius || 7,
            fillColor: fillColor,
            color: layer.style.color || "#ffffff",
            weight: layer.style.weight || 2,
            opacity: layer.opacity,
            fillOpacity: layer.style.fillOpacity * layer.opacity
          });

          return marker;
        },
        style: (feature) => {
          let fillColor = layer.style.fillColor;
          let color = layer.style.color;

          if (layer.style.symbologyType === "choropleth" && layer.style.targetField && feature) {
            const val = feature.properties?.[layer.style.targetField];
            fillColor = getChoroplethColor(val, minVal, maxVal, layer.style.colorScheme);
            color = fillColor;
          } else if (layer.style.symbologyType === "categorized" && layer.style.targetField && feature) {
            const val = feature.properties?.[layer.style.targetField];
            fillColor = getCategorizedColor(val, categoryMap);
            color = fillColor;
          }

          const isSelected = selectedFeatureId && feature?.id === selectedFeatureId;

          return {
            color: isSelected ? "#38bdf8" : color,
            fillColor: isSelected ? "#0284c7" : fillColor,
            weight: isSelected ? (layer.style.weight || 2) + 2 : layer.style.weight || 2,
            opacity: layer.opacity,
            fillOpacity: isSelected ? 0.85 : layer.style.fillOpacity * layer.opacity,
            dashArray: layer.style.dashArray
          };
        },
        onEachFeature: (feature, leafletLayer) => {
          // Dynamic Tooltip Labels
          if (layer.style.showLabels && layer.style.labelField && feature.properties?.[layer.style.labelField]) {
            leafletLayer.bindTooltip(String(feature.properties[layer.style.labelField]), {
              permanent: false,
              direction: "auto",
              className: "bg-slate-900/90 text-sky-200 text-xs px-2 py-1 rounded shadow-md border border-slate-700"
            });
          }

          // Click handler
          leafletLayer.on("click", (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);

            if (activeTool === "select" || activeTool === "identify") {
              onSelectFeature(String(feature.id || feature.properties?.id || Math.random()), layer.id);

              // Construct Attribute Inspector Popup
              const props = feature.properties || {};
              let popupContent = `<div class="font-sans text-xs max-w-xs">`;
              popupContent += `<div class="font-bold text-sky-400 border-b border-slate-700 pb-1 mb-2">${layer.name}</div>`;
              popupContent += `<table class="w-full text-left border-collapse"><tbody>`;
              Object.entries(props).slice(0, 8).forEach(([k, v]) => {
                popupContent += `<tr class="border-b border-slate-800/60"><td class="py-1 pr-2 text-slate-400 font-medium">${k}:</td><td class="py-1 text-slate-200 font-mono text-[11px]">${v}</td></tr>`;
              });
              popupContent += `</tbody></table></div>`;

              L.popup()
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(map);
            }
          });
        }
      }).addTo(map);

      geojsonLayersRef.current.set(layer.id, leafletGeoJson);
    });
  }, [layers, selectedFeatureId, activeTool]);

  // Map Click Tool Router (Measuring, Drawing, Elevation Profile selection)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const clickPoint: [number, number] = [e.latlng.lat, e.latlng.lng];

      if (activeTool === "measure_distance" || activeTool === "measure_area" || activeTool === "elevation_profile") {
        setMeasureCoords((prev) => {
          const next = [...prev, clickPoint];
          updateMeasurementOverlay(next, activeTool);
          return next;
        });
      } else if (activeTool === "draw_point") {
        const newPointFeature = {
          type: "Feature",
          id: `point_${Date.now()}`,
          geometry: {
            type: "Point",
            coordinates: [clickPoint[1], clickPoint[0]]
          },
          properties: {
            title: "Drawn Marker Point",
            created_at: new Date().toLocaleTimeString(),
            latitude: clickPoint[0],
            longitude: clickPoint[1]
          }
        };
        onAddUserFeature?.(newPointFeature);
      } else if (activeTool === "select") {
        onSelectFeature(null, null);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [activeTool, measureCoords]);

  // Double Click / Finish Measurement & Line Profile
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleDblClick = (e: L.LeafletMouseEvent) => {
      if (activeTool === "elevation_profile" && measureCoords.length >= 2) {
        onLineDrawnForElevation?.(measureCoords);
      }
    };

    map.on("dblclick", handleDblClick);
    return () => {
      map.off("dblclick", handleDblClick);
    };
  }, [activeTool, measureCoords]);

  // Reset measure coords when tool changes
  useEffect(() => {
    setMeasureCoords([]);
    measureLayerRef.current?.clearLayers();
    onMeasurementChange?.(null);
  }, [activeTool]);

  // Helper to draw measurement overlays on map
  const updateMeasurementOverlay = (coords: [number, number][], mode: SpatialToolMode) => {
    if (!measureLayerRef.current) return;
    measureLayerRef.current.clearLayers();

    if (coords.length === 0) return;

    // Draw vertex points
    coords.forEach((c) => {
      L.circleMarker(c, {
        radius: 5,
        fillColor: "#0284c7",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1
      }).addTo(measureLayerRef.current!);
    });

    if (mode === "measure_distance" || mode === "elevation_profile") {
      if (coords.length >= 2) {
        const polyline = L.polyline(coords, {
          color: "#38bdf8",
          weight: 3,
          dashArray: "6,6"
        }).addTo(measureLayerRef.current);

        const mRes = calculateMeasurement(coords, "distance");
        onMeasurementChange?.(mRes);

        // Add tooltip at last point
        const lastPt = coords[coords.length - 1];
        L.marker(lastPt, {
          icon: L.divIcon({
            className: "bg-sky-950 text-sky-300 font-mono text-xs px-2 py-1 rounded border border-sky-500 shadow-lg whitespace-nowrap",
            html: `📏 ${mRes.formatted}`
          })
        }).addTo(measureLayerRef.current);
      }
    } else if (mode === "measure_area") {
      if (coords.length >= 3) {
        const polygon = L.polygon(coords, {
          color: "#10b981",
          fillColor: "#34d399",
          fillOpacity: 0.35,
          weight: 2
        }).addTo(measureLayerRef.current);

        const mRes = calculateMeasurement(coords, "area");
        onMeasurementChange?.(mRes);

        const lastPt = coords[coords.length - 1];
        L.marker(lastPt, {
          icon: L.divIcon({
            className: "bg-emerald-950 text-emerald-300 font-mono text-xs px-2 py-1 rounded border border-emerald-500 shadow-lg whitespace-nowrap",
            html: `📐 Area: ${mRes.formatted}`
          })
        }).addTo(measureLayerRef.current);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Mode Status Banner */}
      {activeTool !== "select" && activeTool !== "pan" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur border border-sky-500/50 text-sky-300 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-xl animate-pulse-ring">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>
            {activeTool === "measure_distance" && "Measuring Distance — Click points on map"}
            {activeTool === "measure_area" && "Measuring Area — Click at least 3 points"}
            {activeTool === "draw_point" && "Adding Point Feature — Click anywhere to drop marker"}
            {activeTool === "elevation_profile" && "Elevation Profiling — Click path points, double-click to generate graph"}
          </span>
          <button
            onClick={() => setMeasureCoords([])}
            className="ml-2 hover:text-white bg-slate-800 px-2 py-0.5 rounded text-[10px]"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
