import React, { useState } from "react";
import {
  Table as TableIcon,
  Search,
  Download,
  Plus,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  Check,
  Trash2
} from "lucide-react";
import type { GISLayer } from "../types/gis";
import { downloadAttributeCSV, downloadGeoJSON } from "../utils/gisEngine";

interface AttributeTableProps {
  layer: GISLayer;
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
  onUpdateFeatureProperties: (layerId: string, featureId: string, updatedProps: Record<string, any>) => void;
  onAddField: (layerId: string, fieldName: string, defaultValue: any) => void;
  onClose: () => void;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({
  layer,
  selectedFeatureId,
  onSelectFeature,
  onUpdateFeatureProperties,
  onAddField,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [editingCell, setEditingCell] = useState<{ featureId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [isAddingField, setIsAddingField] = useState(false);

  const features = layer.data.features;
  if (!features.length) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-72 bg-slate-900 border-t border-slate-800 z-[1500] p-4 flex flex-col justify-between shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-200">Attribute Inspector — {layer.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-10 text-slate-500 text-xs">No attribute rows available in layer.</div>
      </div>
    );
  }

  // Get field headers
  const sampleProps = features[0].properties || {};
  const fields = Object.keys(sampleProps);

  // Filter features
  const filteredFeatures = features.filter((f) => {
    if (!searchQuery) return true;
    const props = f.properties || {};
    return Object.values(props).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Sort features
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a.properties?.[sortField];
    const valB = b.properties?.[sortField];

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    let res = 0;
    if (typeof valA === "number" && typeof valB === "number") {
      res = valA - valB;
    } else {
      res = String(valA).localeCompare(String(valB));
    }
    return sortAsc ? res : -res;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleCellSave = (featureId: string, field: string) => {
    const feature = features.find((f) => String(f.id || f.properties?.id) === featureId);
    if (feature) {
      const currentProps = { ...(feature.properties || {}) };
      // Preserve type if numeric
      const originalVal = currentProps[field];
      let finalVal: any = editValue;
      if (typeof originalVal === "number" && !isNaN(Number(editValue))) {
        finalVal = Number(editValue);
      }
      currentProps[field] = finalVal;
      onUpdateFeatureProperties(layer.id, featureId, currentProps);
    }
    setEditingCell(null);
  };

  const handleAddNewField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    onAddField(layer.id, newFieldName.trim().toLowerCase().replace(/\s+/g, "_"), "N/A");
    setNewFieldName("");
    setIsAddingField(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-80 bg-slate-900/98 backdrop-blur border-t border-slate-700 z-[1500] flex flex-col shadow-2xl transition-all animate-in slide-in-from-bottom duration-200">
      {/* Top Header Controls */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <TableIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <h3 className="font-bold text-xs text-slate-100 truncate">
            Attribute Inspector Table — <span className="text-sky-400">{layer.name}</span>
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            {sortedFeatures.length} / {features.length} records
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attribute table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md pl-8 pr-3 py-1 font-medium focus:outline-none focus:border-sky-500 w-48"
            />
          </div>

          <button
            onClick={() => setIsAddingField(!isAddingField)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs px-2.5 py-1 rounded border border-slate-700 font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>

          <button
            onClick={() => downloadAttributeCSV(layer)}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2.5 py-1 rounded font-medium shadow transition"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => downloadGeoJSON(layer)}
            className="flex items-center gap-1 bg-sky-700 hover:bg-sky-600 text-white text-xs px-2.5 py-1 rounded font-medium shadow transition"
            title="Export GeoJSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GeoJSON</span>
          </button>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Field Inline Bar */}
      {isAddingField && (
        <form
          onSubmit={handleAddNewField}
          className="bg-sky-950/60 border-b border-sky-800 p-2 flex items-center gap-2 px-4"
        >
          <span className="text-xs text-sky-300 font-medium">New Column Name:</span>
          <input
            type="text"
            placeholder="e.g. risk_category, population_2026"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="bg-slate-900 border border-sky-600 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:outline-none w-64"
          />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3 py-1 rounded font-medium"
          >
            Create Column
          </button>
          <button
            type="button"
            onClick={() => setIsAddingField(false)}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Attribute Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-2 border-r border-slate-800 w-12 text-center">FID</th>
              {fields.map((field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="p-2 border-r border-slate-800 cursor-pointer hover:bg-slate-900 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{field}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
            {sortedFeatures.map((feat, idx) => {
              const featId = String(feat.id || feat.properties?.id || idx);
              const isSelected = selectedFeatureId === featId;
              const props = feat.properties || {};

              return (
                <tr
                  key={featId}
                  onClick={() => onSelectFeature(featId)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? "bg-sky-950/80 text-sky-200 border-l-4 border-l-sky-400 font-semibold"
                      : "hover:bg-slate-800/60"
                  }`}
                >
                  <td className="p-2 border-r border-slate-800/80 text-center text-slate-500">
                    {idx + 1}
                  </td>
                  {fields.map((field) => {
                    const isEditing =
                      editingCell?.featureId === featId && editingCell?.field === field;
                    const cellVal = props[field];

                    return (
                      <td
                        key={field}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingCell({ featureId: featId, field });
                          setEditValue(cellVal !== undefined ? String(cellVal) : "");
                        }}
                        className="p-2 border-r border-slate-800/80 max-w-xs truncate"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                              className="bg-slate-900 border border-sky-500 text-sky-200 text-xs px-1.5 py-0.5 rounded focus:outline-none w-full"
                            />
                            <button
                              onClick={() => handleCellSave(featId, field)}
                              className="bg-emerald-600 text-white p-0.5 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span>{cellVal !== undefined ? String(cellVal) : ""}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
