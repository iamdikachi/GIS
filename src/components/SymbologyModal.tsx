import React, { useState } from "react";
import { Sliders, Palette, Tag, Check, X } from "lucide-react";
import type { GISLayer, LayerStyle, SymbologyType } from "../types/gis";

interface SymbologyModalProps {
  layer: GISLayer;
  onSaveStyle: (layerId: string, newStyle: LayerStyle) => void;
  onClose: () => void;
}

const COLOR_RAMPS = [
  { name: "Heat / Danger (Yellow-Orange-Red)", colors: ["#fef08a", "#f97316", "#dc2626"] },
  { name: "Emerald Bio (Light-Dark Green)", colors: ["#d1fae5", "#10b981", "#047857"] },
  { name: "Oceanic Blue (Light-Dark Blue)", colors: ["#e0f2fe", "#38bdf8", "#0369a1"] },
  { name: "Purples (Violet-Deep Purple)", colors: ["#f3e8ff", "#a855f7", "#581c87"] },
  { name: "Grayscale (Light-Dark Gray)", colors: ["#f1f5f9", "#64748b", "#0f172a"] }
];

export const SymbologyModal: React.FC<SymbologyModalProps> = ({
  layer,
  onSaveStyle,
  onClose
}) => {
  const [style, setStyle] = useState<LayerStyle>({ ...layer.style });

  // Get field names from first feature properties
  const sampleProperties = layer.data.features[0]?.properties || {};
  const propertyFields = Object.keys(sampleProperties);

  const numericFields = propertyFields.filter((f) => typeof sampleProperties[f] === "number");

  const handleSave = () => {
    onSaveStyle(layer.id, style);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Layer Cartography & Symbology — {layer.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
          {/* Symbology Type Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
              Render Symbology Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "single", label: "Single Symbol" },
                { id: "choropleth", label: "Choropleth (Graduated)" },
                { id: "categorized", label: "Categorized (Unique)" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setStyle({ ...style, symbologyType: item.id as SymbologyType })}
                  className={`p-2.5 rounded border text-center font-medium transition ${
                    style.symbologyType === item.id
                      ? "bg-sky-950 border-sky-500 text-sky-300"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Choropleth Field & Ramp Selection */}
          {style.symbologyType === "choropleth" && (
            <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Numerical Target Field:
                </label>
                <select
                  value={style.targetField || ""}
                  onChange={(e) => setStyle({ ...style, targetField: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                >
                  <option value="">Select numeric property field...</option>
                  {numericFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Color Ramp Scale:</label>
                <div className="space-y-1.5">
                  {COLOR_RAMPS.map((ramp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setStyle({ ...style, colorScheme: ramp.colors })}
                      className={`w-full p-2 rounded border flex items-center justify-between transition ${
                        JSON.stringify(style.colorScheme) === JSON.stringify(ramp.colors)
                          ? "bg-slate-800 border-sky-500"
                          : "bg-slate-850/60 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-slate-300 font-medium">{ramp.name}</span>
                      <div className="flex items-center gap-1">
                        {ramp.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded border border-white/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Categorized Field Selection */}
          {style.symbologyType === "categorized" && (
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <label className="block text-slate-400 font-medium mb-1">
                Category Property Field:
              </label>
              <select
                value={style.targetField || ""}
                onChange={(e) => setStyle({ ...style, targetField: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="">Select field for distinct categories...</option>
                {propertyFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Color & Size Pickers */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Fill Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.fillColor}
                  onChange={(e) => setStyle({ ...style, fillColor: e.target.value })}
                  className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={style.fillColor}
                  onChange={(e) => setStyle({ ...style, fillColor: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Stroke / Border Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.color}
                  onChange={(e) => setStyle({ ...style, color: e.target.value })}
                  className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={style.color}
                  onChange={(e) => setStyle({ ...style, color: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Fill Opacity: {Math.round(style.fillOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={style.fillOpacity}
                onChange={(e) => setStyle({ ...style, fillOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Stroke Thickness: {style.weight}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={style.weight}
                onChange={(e) => setStyle({ ...style, weight: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </div>

          {/* Dynamic Map Labels Section */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={style.showLabels || false}
                  onChange={(e) => setStyle({ ...style, showLabels: e.target.checked })}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500"
                />
                <span>Enable Dynamic Map Feature Labels</span>
              </label>
            </div>

            {style.showLabels && (
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <label className="block text-slate-400 font-medium mb-1">
                  Label Field Value:
                </label>
                <select
                  value={style.labelField || ""}
                  onChange={(e) => setStyle({ ...style, labelField: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                >
                  <option value="">Select property field for text labels...</option>
                  {propertyFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5 shadow-lg shadow-sky-950"
          >
            <Check className="w-4 h-4" />
            <span>Apply Symbology</span>
          </button>
        </div>
      </div>
    </div>
  );
};
