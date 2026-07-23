import React, { useState } from "react";
import { Sparkles, Send, Bot, Layers, Check, AlertCircle, Loader2, X } from "lucide-react";
import type { GISLayer } from "../types/gis";

interface AIGeospatialAnalystProps {
  layers: GISLayer[];
  onAddGeneratedLayer: (layer: GISLayer) => void;
  onClose: () => void;
}

const PRESET_PROMPTS = [
  "Analyze Lagos hospital coverage vs flood risk zones",
  "Generate 6 emergency shelter points in Victoria Island, Lagos",
  "Recommend 2km transit buffer zones along Lagos Rail Corridor",
  "Create a coastal sea-level inundation risk polygon for Atlantic waterfront",
  "Find urban districts with high population density in Ikeja"
];

export const AIGeospatialAnalyst: React.FC<AIGeospatialAnalystProps> = ({
  layers,
  onAddGeneratedLayer,
  onClose
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<{
    explanation: string;
    recommendedTools?: string[];
    layerName?: string;
    geojson?: any;
  } | null>(null);

  const handleAskAI = async (textPrompt: string) => {
    const activeQuery = textPrompt || prompt;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const layersSummary = layers.map((l) => ({
        name: l.name,
        type: l.geometryType || l.type,
        featureCount: l.featureCount
      }));

      const res = await fetch("/api/gis/ai-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activeQuery,
          layersSummary
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to receive AI spatial analysis");
      }

      setResponse(data);

      // If AI returned a generated GeoJSON feature collection, add it to map!
      if (data.geojson && data.geojson.features && data.geojson.features.length > 0) {
        const generatedLayer: GISLayer = {
          id: `ai_layer_${Date.now()}`,
          name: data.layerName || `AI Generated: ${activeQuery.slice(0, 24)}...`,
          type: "vector",
          geometryType: data.geojson.features[0]?.geometry?.type || "Point",
          visible: true,
          opacity: 0.85,
          featureCount: data.geojson.features.length,
          createdAt: new Date().toISOString(),
          category: "AI Spatial Generation",
          style: {
            color: "#818cf8",
            fillColor: "#6366f1",
            fillOpacity: 0.6,
            weight: 2,
            pointRadius: 7,
            symbologyType: "single",
            showLabels: true,
            labelField: Object.keys(data.geojson.features[0]?.properties || {})[0] || "title"
          },
          data: data.geojson
        };

        onAddGeneratedLayer(generatedLayer);
      }
    } catch (err: any) {
      setError(err.message || "Error contacting AI Spatial Analyst server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-slate-900/98 backdrop-blur border-l border-slate-800 flex flex-col z-20 shadow-2xl h-full">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
            AI Spatial Intelligence Analyst
          </h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-lg text-indigo-200">
          <p className="font-medium text-slate-200">Gemini Spatial Copilot</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Ask natural language questions about your map datasets, generate synthetic GeoJSON layers, or formulate complex GIS geoprocessing workflows.
          </p>
        </div>

        {/* Preset Prompt Chips */}
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Suggested Geospatial Prompts:
          </div>
          <div className="space-y-1.5">
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => {
                  setPrompt(p);
                  handleAskAI(p);
                }}
                className="w-full text-left p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 text-[11px] font-medium transition flex items-center justify-between"
              >
                <span>{p}</span>
                <Sparkles className="w-3 h-3 text-indigo-400 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* AI Output Response */}
        {loading && (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              Analyzing spatial topology & layer attributes...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-200">Analysis Error</div>
              <div className="text-[11px] text-rose-300/80 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {response && (
          <div className="space-y-3 bg-slate-950/80 border border-indigo-500/40 p-3.5 rounded-lg">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs border-b border-slate-800 pb-2">
              <Bot className="w-4 h-4" />
              <span>GIS AI Analysis Report</span>
            </div>

            <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line">
              {response.explanation}
            </p>

            {response.recommendedTools && response.recommendedTools.length > 0 && (
              <div className="pt-2">
                <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">
                  Recommended Geoprocessing Tools:
                </div>
                <div className="flex flex-wrap gap-1">
                  {response.recommendedTools.map((t, i) => (
                    <span
                      key={i}
                      className="bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] px-2 py-0.5 rounded font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {response.geojson && (
              <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-emerald-300 text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Added new vector layer to Map Canvas!</span>
                </div>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Prompt Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI spatial copilot..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskAI(prompt)}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
          <button
            disabled={loading || !prompt.trim()}
            onClick={() => handleAskAI(prompt)}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
