import React, { useState } from "react";
import {
  Compass,
  Maximize,
  Radio,
  Share2,
  PieChart,
  Ruler,
  TrendingUp,
  X,
  Play,
  Layers,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { GISLayer, SpatialToolMode, ElevationPoint, MeasurementResult } from "../types/gis";
import {
  generateBufferLayer,
  generateVoronoiLayer,
  generateCentroidLayer,
  generateBBoxLayer,
  performSpatialJoin
} from "../utils/gisEngine";

interface GeoprocessingToolbarProps {
  layers: GISLayer[];
  activeTool: SpatialToolMode;
  onSelectTool: (tool: SpatialToolMode) => void;
  onAddLayer: (newLayer: GISLayer) => void;
  measurementResult: MeasurementResult | null;
  elevationProfileData: ElevationPoint[];
  onClose: () => void;
}

export const GeoprocessingToolbar: React.FC<GeoprocessingToolbarProps> = ({
  layers,
  activeTool,
  onSelectTool,
  onAddLayer,
  measurementResult,
  elevationProfileData,
  onClose
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>(layers[0]?.id || "");
  const [secondaryLayerId, setSecondaryLayerId] = useState<string>(layers[1]?.id || "");
  const [bufferDistance, setBufferDistance] = useState<number>(1);
  const [bufferUnit, setBufferUnit] = useState<"meters" | "kilometers" | "miles">("kilometers");
  const [activeTab, setActiveTab] = useState<"buffer" | "voronoi" | "spatial_join" | "elevation" | "bbox">("buffer");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const secondaryLayer = layers.find((l) => l.id === secondaryLayerId);

  // Run Buffer Geoprocessing
  const handleRunBuffer = () => {
    if (!selectedLayer) return;
    try {
      const buffered = generateBufferLayer(selectedLayer, bufferDistance, bufferUnit);
      onAddLayer(buffered);
      setStatusMessage(`Created buffer layer with ${buffered.featureCount} polygons.`);
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    }
  };

  // Run Voronoi Geoprocessing
  const handleRunVoronoi = () => {
    if (!selectedLayer) return;
    try {
      const voronoi = generateVoronoiLayer(selectedLayer);
      if (voronoi) {
        onAddLayer(voronoi);
        setStatusMessage(`Created Voronoi Tessellation with ${voronoi.featureCount} cells.`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    }
  };

  // Run Centroid Geoprocessing
  const handleRunCentroids = () => {
    if (!selectedLayer) return;
    const centroids = generateCentroidLayer(selectedLayer);
    onAddLayer(centroids);
    setStatusMessage(`Created centroids layer for ${selectedLayer.name}.`);
  };

  // Run Bounding Box Geoprocessing
  const handleRunBBox = () => {
    if (!selectedLayer) return;
    const bboxLayer = generateBBoxLayer(selectedLayer);
    onAddLayer(bboxLayer);
    setStatusMessage(`Generated bounding box layer.`);
  };

  // Run Spatial Join Geoprocessing
  const handleRunSpatialJoin = () => {
    if (!selectedLayer || !secondaryLayer) return;
    try {
      const pointLayer = selectedLayer.geometryType === "Point" ? selectedLayer : secondaryLayer;
      const polyLayer = selectedLayer.geometryType === "Point" ? secondaryLayer : selectedLayer;

      const joined = performSpatialJoin(pointLayer, polyLayer);
      onAddLayer(joined);
      setStatusMessage(`Spatial join calculated points inside polygon zones.`);
    } catch (e: any) {
      setStatusMessage(`Error during spatial join: ${e.message}`);
    }
  };

  return (
    <div className="w-96 bg-slate-900/98 backdrop-blur border-l border-slate-800 flex flex-col z-20 shadow-2xl h-full">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
            Spatial Geoprocessing & Analysis
          </h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-[11px] font-medium text-slate-400">
        <button
          onClick={() => {
            setActiveTab("buffer");
            onSelectTool("select");
          }}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === "buffer"
              ? "border-sky-500 text-sky-300 bg-slate-900"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Buffer
        </button>
        <button
          onClick={() => {
            setActiveTab("voronoi");
            onSelectTool("select");
          }}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === "voronoi"
              ? "border-sky-500 text-sky-300 bg-slate-900"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Voronoi
        </button>
        <button
          onClick={() => {
            setActiveTab("spatial_join");
            onSelectTool("select");
          }}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === "spatial_join"
              ? "border-sky-500 text-sky-300 bg-slate-900"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Join
        </button>
        <button
          onClick={() => {
            setActiveTab("elevation");
            onSelectTool("elevation_profile");
          }}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === "elevation"
              ? "border-sky-500 text-sky-300 bg-slate-900"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
        {/* Layer Target Selector */}
        {activeTab !== "elevation" && (
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Input Target Vector Layer:
            </label>
            <select
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1.5 font-medium"
            >
              {layers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.featureCount} features)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab 1: Buffer Tool */}
        {activeTab === "buffer" && (
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Proximity Buffer Analysis</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generates offset polygon boundary zones surrounding points, lines, or polygons at a specified geodesic radius.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Buffer Distance:</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={bufferDistance}
                  onChange={(e) => setBufferDistance(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Units:</label>
                <select
                  value={bufferUnit}
                  onChange={(e) => setBufferUnit(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 font-medium"
                >
                  <option value="kilometers">Kilometers (km)</option>
                  <option value="meters">Meters (m)</option>
                  <option value="miles">Miles (mi)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunBuffer}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 rounded shadow flex items-center justify-center gap-1.5 transition mt-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Buffer Analysis</span>
            </button>
          </div>
        )}

        {/* Tab 2: Voronoi Tessellation */}
        {activeTab === "voronoi" && (
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Voronoi Proximity Polygon Generator</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Constructs Thiessen / Voronoi polygons around points. Every location inside a Voronoi polygon is closer to its seed point than to any other.
            </p>

            <button
              onClick={handleRunVoronoi}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded shadow flex items-center justify-center gap-1.5 transition mt-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Generate Voronoi Polygons</span>
            </button>
          </div>
        )}

        {/* Tab 3: Spatial Join */}
        {activeTab === "spatial_join" && (
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Point-In-Polygon Spatial Join</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Overlay points onto polygon boundaries (e.g. Healthcare Facilities inside Zoning Districts) and aggregate feature counts.
            </p>

            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Overlay Polygon Layer:</label>
              <select
                value={secondaryLayerId}
                onChange={(e) => setSecondaryLayerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 font-medium"
              >
                {layers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunSpatialJoin}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded shadow flex items-center justify-center gap-1.5 transition mt-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Spatial Join</span>
            </button>
          </div>
        )}

        {/* Tab 4: Elevation Profile */}
        {activeTab === "elevation" && (
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Terrain Cross-Section Elevation Profile</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click on the Map Canvas to draw a transect path. Double-click to generate topographic profile graph.
            </p>

            {elevationProfileData.length > 0 ? (
              <div className="pt-2">
                <div className="h-44 w-full bg-slate-950 p-2 rounded border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={elevationProfileData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="distanceKm" stroke="#94a3b8" fontSize={10} unit="km" />
                      <YAxis stroke="#94a3b8" fontSize={10} unit="m" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#38bdf8", color: "#f8fafc" }}
                      />
                      <Area type="monotone" dataKey="elevationMeters" stroke="#38bdf8" fill="#0284c7" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex justify-between font-mono">
                  <span>Start: {elevationProfileData[0]?.elevationMeters}m</span>
                  <span>Max: {Math.max(...elevationProfileData.map((d) => d.elevationMeters))}m</span>
                  <span>End: {elevationProfileData[elevationProfileData.length - 1]?.elevationMeters}m</span>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-700 rounded text-center text-slate-500 text-xs">
                Draw a line on the map to display profile graph.
              </div>
            )}
          </div>
        )}

        {/* Additional Utility Buttons */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Geometric Utilities
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRunCentroids}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs py-1.5 px-2 rounded font-medium flex items-center justify-center gap-1 transition"
            >
              <Maximize className="w-3.5 h-3.5 text-sky-400" />
              <span>Centroids</span>
            </button>

            <button
              onClick={handleRunBBox}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs py-1.5 px-2 rounded font-medium flex items-center justify-center gap-1 transition"
            >
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Bounding Box</span>
            </button>
          </div>
        </div>

        {/* Execution Feedback Banner */}
        {statusMessage && (
          <div className="p-2.5 bg-sky-950/80 border border-sky-500/50 rounded text-sky-300 text-xs flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-sky-400 hover:text-white">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
