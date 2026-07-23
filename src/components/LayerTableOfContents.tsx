import React, { useState } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Table,
  Maximize2,
  Download,
  Trash2,
  Plus,
  Map as MapIcon,
  ChevronDown,
  ChevronRight,
  Database,
  Upload,
  Globe,
  Sparkles
} from "lucide-react";
import type { GISLayer, BasemapType } from "../types/gis";
import { SAMPLE_GIS_LAYERS } from "../data/sampleDatasets";

interface LayerTOCProps {
  layers: GISLayer[];
  activeLayerId: string | null;
  selectedBasemap: BasemapType;
  onSelectBasemap: (basemap: BasemapType) => void;
  onToggleVisibility: (layerId: string) => void;
  onChangeOpacity: (layerId: string, opacity: number) => void;
  onOpenStyleModal: (layer: GISLayer) => void;
  onOpenAttributeTable: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onAddLayer: (layer: GISLayer) => void;
  onSelectActiveLayer: (layerId: string) => void;
}

export const LayerTableOfContents: React.FC<LayerTOCProps> = ({
  layers,
  activeLayerId,
  selectedBasemap,
  onSelectBasemap,
  onToggleVisibility,
  onChangeOpacity,
  onOpenStyleModal,
  onOpenAttributeTable,
  onRemoveLayer,
  onAddLayer,
  onSelectActiveLayer
}) => {
  const [isAddingLayerOpen, setIsAddingLayerOpen] = useState(false);
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);

  // File Upload Handler for GeoJSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const geojson = JSON.parse(evt.target?.result as string);
        if (geojson.type === "FeatureCollection" || geojson.type === "Feature") {
          const fc = geojson.type === "Feature" ? { type: "FeatureCollection", features: [geojson] } : geojson;
          
          const newLayer: GISLayer = {
            id: `uploaded_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            type: "vector",
            geometryType: fc.features[0]?.geometry?.type || "Point",
            visible: true,
            opacity: 0.8,
            featureCount: fc.features.length,
            createdAt: new Date().toISOString(),
            category: "Imported User Data",
            style: {
              color: "#38bdf8",
              fillColor: "#0284c7",
              fillOpacity: 0.5,
              weight: 2,
              pointRadius: 6,
              symbologyType: "single"
            },
            data: fc
          };

          onAddLayer(newLayer);
          setIsAddingLayerOpen(false);
        } else {
          alert("Invalid GeoJSON file structure. Must be a FeatureCollection.");
        }
      } catch (err) {
        alert("Failed to parse JSON file. Ensure it is valid GeoJSON format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-80 h-full bg-slate-900/95 backdrop-blur border-r border-slate-800 flex flex-col z-20 shadow-2xl">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Layer Table of Contents
          </h2>
        </div>
        <button
          onClick={() => setIsAddingLayerOpen(!isAddingLayerOpen)}
          className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white text-xs px-2 py-1 rounded transition font-medium shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Layer</span>
        </button>
      </div>

      {/* Add Layer Modal / Popover */}
      {isAddingLayerOpen && (
        <div className="p-3 border-b border-slate-800 bg-slate-950/80 animate-in fade-in duration-150">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>Import or Add Spatial Data</span>
            <button
              onClick={() => setIsAddingLayerOpen(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 hover:border-sky-500 text-xs py-2 px-3 rounded cursor-pointer transition font-medium">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload GeoJSON File</span>
              <input
                type="file"
                accept=".json,.geojson"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-2 mb-1">
              Curated Sample GIS Datasets
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {SAMPLE_GIS_LAYERS.map((sample) => {
                const isAlreadyAdded = layers.some((l) => l.id === sample.id);
                return (
                  <button
                    key={sample.id}
                    disabled={isAlreadyAdded}
                    onClick={() => {
                      onAddLayer(sample);
                      setIsAddingLayerOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition border ${
                      isAlreadyAdded
                        ? "bg-slate-900/50 border-slate-800/80 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-sky-500/50 text-slate-200"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">{sample.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {sample.category} • {sample.featureCount} features
                      </div>
                    </div>
                    {isAlreadyAdded ? (
                      <span className="text-[10px] text-emerald-400">Added</span>
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {layers.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs px-4">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No map layers active.</p>
            <p className="mt-1 text-[11px] text-slate-600">
              Click "Add Layer" to load GIS datasets or import GeoJSON.
            </p>
          </div>
        ) : (
          layers.map((layer) => {
            const isActive = activeLayerId === layer.id;
            const isExpanded = expandedLayerId === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => onSelectActiveLayer(layer.id)}
                className={`rounded-lg border transition ${
                  isActive
                    ? "bg-slate-800/90 border-sky-500/60 shadow-md shadow-sky-950/40"
                    : "bg-slate-850/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Main Item Row */}
                <div className="p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(layer.id);
                      }}
                      className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition"
                      title={layer.visible ? "Hide Layer" : "Show Layer"}
                    >
                      {layer.visible ? (
                        <Eye className="w-4 h-4 text-sky-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    {/* Color Legend Preview */}
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: layer.style.fillColor || layer.style.color }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {layer.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span className="capitalize">{layer.geometryType || "Vector"}</span>
                        <span>•</span>
                        <span>{layer.featureCount} features</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedLayerId(isExpanded ? null : layer.id);
                      }}
                      className="text-slate-400 hover:text-slate-200 p-1 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Controls & Options */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2 bg-slate-900/40 rounded-b-lg">
                    {/* Opacity Slider */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Opacity:</span>
                      <span className="font-mono">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={layer.opacity}
                      onChange={(e) => onChangeOpacity(layer.id, parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />

                    {/* Action Bar */}
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <button
                        onClick={() => onOpenStyleModal(layer)}
                        className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] py-1 px-1.5 rounded border border-slate-700 transition"
                        title="Symbology & Cartography"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Style</span>
                      </button>

                      <button
                        onClick={() => onOpenAttributeTable(layer.id)}
                        className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] py-1 px-1.5 rounded border border-slate-700 transition"
                        title="Open Attribute Table"
                      >
                        <Table className="w-3 h-3" />
                        <span>Table</span>
                      </button>

                      <button
                        onClick={() => onRemoveLayer(layer.id)}
                        className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-rose-950/80 text-rose-400 text-[11px] py-1 px-1.5 rounded border border-slate-700 transition"
                        title="Remove Layer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Basemap Switcher Box at Bottom */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Basemap Tile Layer</span>
        </div>
        <select
          value={selectedBasemap}
          onChange={(e) => onSelectBasemap(e.target.value as BasemapType)}
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1.5 font-medium focus:outline-none focus:border-sky-500"
        >
          <option value="carto_dark">CartoDB Dark Matter (Dark GIS)</option>
          <option value="carto_light">CartoDB Voyager (Light GIS)</option>
          <option value="osm">OpenStreetMap Standard</option>
          <option value="esri_satellite">Esri World Imagery (Satellite)</option>
          <option value="opentopo">OpenTopoMap (Elevation Contours)</option>
        </select>
      </div>
    </div>
  );
};
