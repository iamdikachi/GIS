import React, { useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  User,
  Users,
  Compass,
  Thermometer,
  ShieldCheck,
  Share2,
  Check,
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import type { GISLayer } from "../types/gis";

interface CompanyOfficeLocatorProps {
  layers: GISLayer[];
  onFocusOffice: (lat: number, lng: number, officeTitle: string) => void;
  onClose: () => void;
}

export const CompanyOfficeLocator: React.FC<CompanyOfficeLocatorProps> = ({
  layers,
  onFocusOffice,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all office features from company office layer
  const officeLayer = layers.find((l) => l.id === "layer_company_offices") || layers[2];
  const officeFeatures = officeLayer?.data?.features || [];

  // Extract distinct departments
  const departments = Array.from(
    new Set(officeFeatures.map((f) => f.properties?.department).filter(Boolean))
  );

  // Filtered office list
  const filteredOffices = officeFeatures.filter((f) => {
    const props = f.properties || {};
    const matchesDept = selectedDept === "all" || props.department === selectedDept;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      props.office_title?.toLowerCase().includes(q) ||
      props.room_number?.toLowerCase().includes(q) ||
      props.department?.toLowerCase().includes(q) ||
      props.head_of_office?.toLowerCase().includes(q) ||
      props.building?.toLowerCase().includes(q);

    return matchesDept && matchesSearch;
  });

  const handleCopyLink = (officeId: string, title: string, room: string) => {
    const text = `Company Location GIS: ${title} (${room}) - Afriland Corporate HQ Campus (Victoria Island, Lagos)`;
    navigator.clipboard.writeText(text);
    setCopiedId(officeId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-96 bg-slate-900/98 backdrop-blur border-l border-slate-800 flex flex-col z-20 shadow-2xl h-full">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <div>
            <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
              Company Office & Facility Directory
            </h2>
            <p className="text-[10px] text-slate-400">
              Locate & navigate offices, departments, and rooms
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search office, room #, head of dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none"
          >
            <option value="all">All Company Departments ({officeFeatures.length} offices)</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Office List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredOffices.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p>No company offices found matching criteria.</p>
          </div>
        ) : (
          filteredOffices.map((f) => {
            const props = f.properties || {};
            const coords = (f.geometry as any)?.coordinates || [-122.416, 37.782];
            const officeId = String(f.id);

            return (
              <div
                key={officeId}
                className="bg-slate-850 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-3 space-y-2 transition group shadow"
              >
                {/* Title & Room Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition flex items-center gap-1.5">
                      <span>{props.office_title}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono font-medium mt-0.5">
                      {props.room_number} • {props.building}
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded font-mono shrink-0">
                    Ext: {props.extension}
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1 text-slate-400">
                    <User className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate">{props.head_of_office}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Cap: {props.capacity} Persons</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <Thermometer className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>HVAC: {props.hvac_temp || "71°F"}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{props.status || "Active"}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleCopyLink(officeId, props.office_title, props.room_number)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                  >
                    {copiedId === officeId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied GIS Info</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" />
                        <span>Share Location</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onFocusOffice(coords[1], coords[0], props.office_title)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1 shadow transition"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Locate on Map</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
