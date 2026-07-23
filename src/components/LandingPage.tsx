import React from "react";
import {
  Globe,
  Map as MapIcon,
  Building2,
  ShieldAlert,
  BarChart3,
  Database,
  Compass,
  ArrowRight,
  ShieldCheck,
  Users,
  Ruler,
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
  LocateFixed,
  Loader2
} from "lucide-react";
import type { GISLayer } from "../types/gis";
import type { ActivePageView } from "./GISHeader";

interface LandingPageProps {
  layers: GISLayer[];
  onNavigate: (view: ActivePageView) => void;
  onFocusOffice: (lat: number, lng: number, title: string) => void;
  onLocateUser?: () => void;
  isLocating?: boolean;
  userLocationActive?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  layers,
  onNavigate,
  onFocusOffice,
  onLocateUser,
  isLocating = false,
  userLocationActive = false
}) => {
  const buildingLayer = layers.find((l) => l.id === "layer_company_buildings");
  const officeLayer = layers.find((l) => l.id === "layer_company_offices");
  const boundaryLayer = layers.find((l) => l.id === "layer_company_boundary");

  const buildings = buildingLayer?.data?.features || [];
  const offices = officeLayer?.data?.features || [];
  const boundaries = boundaryLayer?.data?.features || [];

  const totalOccupancy = buildings.reduce(
    (acc, b) => acc + (b.properties?.occupancy || 0),
    0
  );
  const totalArea = boundaries.reduce(
    (acc, b) => acc + (b.properties?.total_area_sqft || 0),
    0
  );

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 px-6 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-semibold">
            <Globe className="w-4 h-4 text-sky-400 animate-spin-slow" />
            <span>Afriland Corporate GIS & Spatial Intelligence Platform (Nigeria HQ)</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Geographical Information System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400">
              For Headquarters & Facility Operations
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            Manage company boundaries, department complexes, office directory extensions, real-time spatial analysis, and executive property perimeter redraws in one comprehensive spatial portal.
          </p>

          {/* Quick Nav Launch Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onLocateUser && (
              <button
                onClick={onLocateUser}
                disabled={isLocating}
                className={`font-bold px-5 py-3 rounded-xl flex items-center gap-2.5 shadow-lg transition group text-sm border ${
                  userLocationActive
                    ? "bg-emerald-950 border-emerald-500 text-emerald-200 shadow-emerald-950/80"
                    : "bg-sky-950 hover:bg-sky-900 border-sky-400/60 text-sky-200 shadow-sky-950/60"
                }`}
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                ) : (
                  <LocateFixed className="w-4 h-4 text-sky-400 group-hover:rotate-45 transition-transform" />
                )}
                <span>
                  {isLocating
                    ? "Detecting GPS Position..."
                    : userLocationActive
                    ? "📍 Relocated to Your Coordinates"
                    : "📍 Relocate GIS Around My Location"}
                </span>
              </button>
            )}

            <button
              onClick={() => onNavigate("map")}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2.5 shadow-lg shadow-sky-950/60 transition group text-sm"
            >
              <MapIcon className="w-4 h-4" />
              <span>Launch Interactive GIS Map</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => onNavigate("offices")}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4 py-3 rounded-xl flex items-center gap-2 transition text-sm"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Office Directory ({offices.length} Rooms)</span>
            </button>

            <button
              onClick={() => onNavigate("redraw")}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4 py-3 rounded-xl flex items-center gap-2 transition text-sm"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Redraw GIS Boundary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Corporate Spatial Metrics */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/95 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="p-3 bg-sky-950 text-sky-400 rounded-lg border border-sky-800/50">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Campus Footprint</div>
              <div className="text-lg font-bold text-slate-100">{totalArea.toLocaleString()} sq ft</div>
            </div>
          </div>

          <div className="bg-slate-900/95 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="p-3 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800/50">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Buildings</div>
              <div className="text-lg font-bold text-slate-100">{buildings.length} Complexes</div>
            </div>
          </div>

          <div className="bg-slate-900/95 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="p-3 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/50">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">On-Site Staff</div>
              <div className="text-lg font-bold text-slate-100">{totalOccupancy} Personnel</div>
            </div>
          </div>

          <div className="bg-slate-900/95 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="p-3 bg-purple-950 text-purple-400 rounded-lg border border-purple-800/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">GIS Layers</div>
              <div className="text-lg font-bold text-slate-100">{layers.length} Layers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Module Showcase Cards */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Core GIS Modules & Platform Applications
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto">
            Select a module to access spatial analysis tools, office lookups, executive polygon drawing, or spatial dataset management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Interactive GIS Map */}
          <div
            onClick={() => onNavigate("map")}
            className="bg-slate-900 border border-slate-800 hover:border-sky-500 rounded-2xl p-5 space-y-4 cursor-pointer transition group shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center justify-center group-hover:scale-110 transition">
                <MapIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition">
                Interactive GIS Map Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leaflet-powered map canvas with vector/raster layers, area/distance measurements, Voronoi polygons, and AI Copilot.
              </p>
            </div>
            <div className="pt-2 text-xs text-sky-400 font-semibold flex items-center gap-1">
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Office Locator */}
          <div
            onClick={() => onNavigate("offices")}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-2xl p-5 space-y-4 cursor-pointer transition group shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center group-hover:scale-110 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition">
                Office & Room Directory
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directory search for department rooms, CEO suites, R&D labs, extensions, HVAC status, and location bookmarks.
              </p>
            </div>
            <div className="pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>Find Offices</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Boundary Redraw */}
          <div
            onClick={() => onNavigate("redraw")}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-2xl p-5 space-y-4 cursor-pointer transition group shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center group-hover:scale-110 transition">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition">
                Executive Boundary Redraw
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Privileged tool for the head of the company to redraw property perimeter polygons, adjust vertices, and log authority records.
              </p>
            </div>
            <div className="pt-2 text-xs text-amber-400 font-semibold flex items-center gap-1">
              <span>Redraw Boundaries</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Analytics */}
          <div
            onClick={() => onNavigate("analytics")}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-5 space-y-4 cursor-pointer transition group shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center group-hover:scale-110 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition">
                Facility GIS Analytics
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analytical charts for personnel occupancy, building capacities, floor counts, and department footprint distributions.
              </p>
            </div>
            <div className="pt-2 text-xs text-indigo-400 font-semibold flex items-center gap-1">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* Featured Campus Headquarters Directory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <span>Headquarters Buildings Directory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Key facilities registered in Apex Tech Campus GIS
              </p>
            </div>

            <button
              onClick={() => onNavigate("offices")}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buildings.slice(0, 3).map((b) => {
              const props = b.properties || {};
              return (
                <div
                  key={b.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 font-mono">
                      {props.building_code}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {props.building_type}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{props.building_name}</h4>
                  <p className="text-xs text-slate-400">{props.department}</p>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex justify-between">
                    <span>Head: {props.head_of_dept}</span>
                    <span className="text-emerald-400 font-mono">{props.occupancy} Staff</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
