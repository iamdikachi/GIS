import React, { useState } from "react";
import {
  Database,
  Search,
  Download,
  Upload,
  Layers,
  FileJson,
  Edit2,
  Trash2,
  Plus,
  Compass,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import type { GISLayer } from "../types/gis";

interface CompanyDatasetsViewProps {
  layers: GISLayer[];
  onNavigateToMap: () => void;
  onOpenAttributeTable: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onAddLayer: (newLayer: GISLayer) => void;
}

export const CompanyDatasetsView: React.FC<CompanyDatasetsViewProps> = ({
  layers,
  onNavigateToMap,
  onOpenAttributeTable,
  onRemoveLayer,
  onAddLayer
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = Array.from(new Set(layers.map((l) => l.category).filter(Boolean)));

  const filteredLayers = layers.filter((l) => {
    const matchesCat = selectedCategory === "all" || l.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleExportLayerJSON = (layer: GISLayer) => {
    const jsonStr = JSON.stringify(layer.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${layer.name.toLowerCase().replace(/\s+/g, "_")}_geojson.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">
              Company Geographical Information Data Hub & Records
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain, query, export, and manage spatial feature attribute tables and GeoJSON collections.
          </p>
        </div>

        <button
          onClick={onNavigateToMap}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow transition"
        >
          <Compass className="w-4 h-4" />
          <span>Launch Interactive GIS Map</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search spatial dataset or layer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none"
          >
            <option value="all">All Data Categories ({layers.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLayers.map((layer) => (
          <div
            key={layer.id}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-4 flex flex-col justify-between space-y-4 transition shadow"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 leading-snug">
                    {layer.name}
                  </h3>
                  <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                    Category: {layer.category || "General GIS"}
                  </div>
                </div>

                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono shrink-0">
                  {layer.geometryType}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Feature Records:</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {layer.data.features.length} features
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Style Symbology:</span>
                  <span className="font-mono text-slate-200 capitalize">
                    {layer.style.symbologyType || "single"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Layer Opacity:</span>
                  <span className="font-mono text-slate-200">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onNavigateToMap();
                  onOpenAttributeTable(layer.id);
                }}
                className="bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Attribute Table</span>
              </button>

              <button
                onClick={() => handleExportLayerJSON(layer)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition"
                title="Download GeoJSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>GeoJSON</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
