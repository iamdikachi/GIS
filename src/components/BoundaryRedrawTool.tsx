import React, { useState } from "react";
import {
  ShieldAlert,
  Edit3,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Layers,
  Save,
  X,
  Sparkles,
  MapPin
} from "lucide-react";
import type { GISLayer } from "../types/gis";

interface BoundaryRedrawToolProps {
  layers: GISLayer[];
  onUpdateBoundaryLayer: (updatedLayer: GISLayer) => void;
  onClose: () => void;
}

export const BoundaryRedrawTool: React.FC<BoundaryRedrawToolProps> = ({
  layers,
  onUpdateBoundaryLayer,
  onClose
}) => {
  // Find company boundary layer
  const boundaryLayer = layers.find((l) => l.id === "layer_company_boundary") || layers[0];
  const boundaries = boundaryLayer?.data?.features || [];

  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const [executivePasscode, setExecutivePasscode] = useState("CEO-8890");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [redrawReason, setRedrawReason] = useState(
    "Campus Lot Acquisition & Security Perimeter Expansion"
  );
  const [authorName, setAuthorName] = useState("Engr. Olumide Adeleke (Group CEO)");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const activeFeature = boundaries[selectedFeatureIndex];
  const currentCoords: [number, number][] =
    (activeFeature?.geometry as any)?.coordinates?.[0] || [];

  // Local state for vertex coordinates
  const [editableCoords, setEditableCoords] = useState<[number, number][]>(currentCoords);

  // When selected boundary feature changes
  const handleSelectFeature = (idx: number) => {
    setSelectedFeatureIndex(idx);
    const feat = boundaries[idx];
    const coords = (feat?.geometry as any)?.coordinates?.[0] || [];
    setEditableCoords(coords);
  };

  // Update a single vertex lat/lng
  const handleVertexChange = (
    vertexIdx: number,
    coordIdx: number, // 0 for lng, 1 for lat
    val: number
  ) => {
    const nextCoords = editableCoords.map((c, i) => {
      if (i === vertexIdx) {
        const updatedPoint: [number, number] = [c[0], c[1]];
        updatedPoint[coordIdx] = val;
        return updatedPoint;
      }
      return c;
    });
    setEditableCoords(nextCoords);
  };

  // Preset offset transform (Expansion)
  const handleApplyPresetExpansion = (deltaLat: number, deltaLng: number) => {
    const nextCoords = editableCoords.map(([lng, lat]) => [
      Number((lng + deltaLng).toFixed(5)),
      Number((lat + deltaLat).toFixed(5))
    ]) as [number, number][];
    setEditableCoords(nextCoords);
    setStatusMsg("Boundary vertex offsets applied.");
  };

  // Save Redrawn Boundary to GIS Layer
  const handleSaveBoundary = () => {
    if (!boundaryLayer) return;

    // Ensure polygon is closed (first point === last point)
    let finalRing = [...editableCoords];
    if (
      finalRing[0][0] !== finalRing[finalRing.length - 1][0] ||
      finalRing[0][1] !== finalRing[finalRing.length - 1][1]
    ) {
      finalRing.push([...finalRing[0]]);
    }

    const updatedFeatures = boundaryLayer.data.features.map((feat, idx) => {
      if (idx === selectedFeatureIndex) {
        return {
          ...feat,
          geometry: {
            ...feat.geometry,
            type: "Polygon",
            coordinates: [finalRing]
          },
          properties: {
            ...(feat.properties || {}),
            last_redrawn: new Date().toISOString().split("T")[0],
            redrawn_by: authorName,
            redraw_reason: redrawReason,
            status: "Official Executive Redrawn Boundary"
          }
        };
      }
      return feat;
    });

    const updatedLayer: GISLayer = {
      ...boundaryLayer,
      data: {
        ...boundaryLayer.data,
        features: updatedFeatures
      }
    };

    onUpdateBoundaryLayer(updatedLayer);
    setStatusMsg("Official Company GIS Boundary successfully redrawn and saved!");
  };

  return (
    <div className="w-96 bg-slate-900/98 backdrop-blur border-l border-slate-800 flex flex-col z-20 shadow-2xl h-full">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <div>
            <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
              Executive Boundary Redrawer
            </h2>
            <p className="text-[10px] text-amber-300 font-mono">
              Head of Company Authorization Mode
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
        {/* Executive Authority Banner */}
        <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-lg flex items-start gap-2 text-amber-200">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300 text-xs">
              Executive Management Privileges
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Enables the head of the company to redraw property perimeter boundaries, re-allocate department zones, and save updated GIS spatial polygons.
            </p>
          </div>
        </div>

        {/* Boundary Selection */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
            Target Company GIS Boundary:
          </label>
          <select
            value={selectedFeatureIndex}
            onChange={(e) => handleSelectFeature(parseInt(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 font-medium"
          >
            {boundaries.map((f, i) => (
              <option key={i} value={i}>
                {f.properties?.boundary_name || `Boundary Polygon #${i + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Executive Metadata Inputs */}
        <div className="space-y-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Authorized Authority (Head of Company):
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Reason for Redrawing GIS Boundary:
            </label>
            <textarea
              rows={2}
              value={redrawReason}
              onChange={(e) => setRedrawReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>
        </div>

        {/* Vertex Coordinate Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Polygon Boundary Vertices ({editableCoords.length} Points)
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleApplyPresetExpansion(0.002, 0.002)}
                className="text-[10px] bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 px-2 py-0.5 rounded font-mono"
                title="Expand Boundary 200m North-East"
              >
                +200m Expand
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 p-2 rounded bg-slate-950/60">
            {editableCoords.map(([lng, lat], idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded text-[11px] font-mono border border-slate-700/60"
              >
                <span className="text-slate-500 w-6 text-center">V{idx + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-1">
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) =>
                      handleVertexChange(idx, 1, parseFloat(e.target.value) || lat)
                    }
                    className="bg-slate-900 border border-slate-700 text-sky-300 rounded px-1.5 py-0.5 text-[10px]"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) =>
                      handleVertexChange(idx, 0, parseFloat(e.target.value) || lng)
                    }
                    className="bg-slate-900 border border-slate-700 text-sky-300 rounded px-1.5 py-0.5 text-[10px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Message */}
        {statusMsg && (
          <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs rounded flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg(null)} className="text-emerald-400">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Save Action Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <button
          onClick={handleSaveBoundary}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>Apply & Commit Redrawn GIS Boundary</span>
        </button>
      </div>
    </div>
  );
};
