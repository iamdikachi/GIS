import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  MousePointer,
  Ruler,
  Square,
  MapPin,
  Compass,
  Sparkles,
  Printer,
  Info,
  Database,
  Building2,
  ShieldAlert,
  BarChart3,
  Map as MapIcon,
  Layers,
  Home,
  ChevronDown,
  Menu,
  Check,
  LocateFixed,
  Loader2
} from "lucide-react";
import type { SpatialToolMode, MapCoordinates, MeasurementResult } from "../types/gis";

export type ActivePageView = "landing" | "map" | "offices" | "redraw" | "analytics" | "datasets";

interface GISHeaderProps {
  activePageView: ActivePageView;
  onSelectPageView: (view: ActivePageView) => void;
  activeTool: SpatialToolMode;
  onSelectTool: (tool: SpatialToolMode) => void;
  isGeoprocessingOpen: boolean;
  onToggleGeoprocessing: () => void;
  isAIAssistantOpen: boolean;
  onToggleAIAssistant: () => void;
  isOfficeLocatorOpen: boolean;
  onToggleOfficeLocator: () => void;
  isBoundaryRedrawOpen: boolean;
  onToggleBoundaryRedraw: () => void;
  onOpenPrinter: () => void;
  coordinates: MapCoordinates;
  measurementResult: MeasurementResult | null;
  onLocateUser?: () => void;
  isLocating?: boolean;
  userLocationActive?: boolean;
}

export const GISHeader: React.FC<GISHeaderProps> = ({
  activePageView,
  onSelectPageView,
  activeTool,
  onSelectTool,
  isGeoprocessingOpen,
  onToggleGeoprocessing,
  isAIAssistantOpen,
  onToggleAIAssistant,
  isOfficeLocatorOpen,
  onToggleOfficeLocator,
  isBoundaryRedrawOpen,
  onToggleBoundaryRedraw,
  onOpenPrinter,
  coordinates,
  measurementResult,
  onLocateUser,
  isLocating = false,
  userLocationActive = false
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navDropdownRef.current &&
        !navDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems: {
    id: ActivePageView;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeColor: string;
  }[] = [
    {
      id: "landing",
      title: "Platform Overview",
      description: "Main corporate portal summary & metrics",
      icon: Home,
      badgeColor: "bg-sky-500"
    },
    {
      id: "map",
      title: "Interactive GIS Map Studio",
      description: "Leaflet spatial canvas, tools & layers",
      icon: MapIcon,
      badgeColor: "bg-sky-500"
    },
    {
      id: "offices",
      title: "Offices & Room Directory",
      description: "Department lookup, personnel & extensions",
      icon: Building2,
      badgeColor: "bg-emerald-500"
    },
    {
      id: "redraw",
      title: "Executive Boundary Redraw",
      description: "Redraw property perimeter & vertices",
      icon: ShieldAlert,
      badgeColor: "bg-amber-500"
    },
    {
      id: "analytics",
      title: "Facility GIS Analytics",
      description: "Occupancy charts, floor capacity & graphs",
      icon: BarChart3,
      badgeColor: "bg-indigo-500"
    },
    {
      id: "datasets",
      title: "Spatial Data Hub & Records",
      description: "GeoJSON attribute tables & export",
      icon: Database,
      badgeColor: "bg-purple-500"
    }
  ];

  const currentItem = navItems.find((item) => item.id === activePageView) || navItems[0];
  const CurrentIcon = currentItem.icon;

  const handleSelectPage = (id: ActivePageView) => {
    onSelectPageView(id);
    setIsNavOpen(false);
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 flex flex-col z-30 select-none shadow-md">
      {/* Top Main Bar */}
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/50 flex items-center justify-center text-sky-400 shadow-inner">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>Geographical Information System</span>
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-700/60 px-1.5 py-0.5 rounded font-mono uppercase">
                Company GIS
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Computerized Spatial Analysis & Company Location Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Dropdown Menu Button */}
        <div className="relative" ref={navDropdownRef}>
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition shadow-lg ${
              isNavOpen
                ? "bg-slate-800 border-sky-500 text-white ring-2 ring-sky-500/30"
                : "bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-200"
            }`}
          >
            <Menu className="w-4 h-4 text-sky-400" />
            <div className="flex items-center gap-2">
              <CurrentIcon className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-slate-100">{currentItem.title}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isNavOpen ? "rotate-180 text-sky-400" : ""
              }`}
            />
          </button>

          {/* Navigation Dropdown Popup Menu */}
          {isNavOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex justify-between items-center">
                <span>Select Application Page</span>
                <span className="text-sky-400 font-mono">6 Views</span>
              </div>

              <div className="space-y-1 pt-1">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = activePageView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectPage(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition group ${
                        isSelected
                          ? "bg-sky-950/80 border border-sky-500/50 text-white"
                          : "hover:bg-slate-800/80 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? "bg-sky-600 text-white"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-100"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-sky-300" : "text-slate-200"
                            }`}
                          >
                            {item.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Tools & Coordinate Status */}
        <div className="flex items-center gap-3">
          {/* Measurement Readout Badge */}
          {measurementResult && (
            <div className="bg-sky-950/80 border border-sky-500/50 text-sky-300 font-mono text-xs px-2.5 py-1 rounded flex items-center gap-1.5 shadow">
              <span className="font-semibold uppercase text-[10px] text-sky-400">
                {measurementResult.type}:
              </span>
              <span>{measurementResult.formatted}</span>
            </div>
          )}

          {/* Live Coordinate Status */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded">
            <span>Lat: {coordinates.lat}°</span>
            <span>Lng: {coordinates.lng}°</span>
            <span className="text-sky-400 font-semibold">Z: {coordinates.zoom}</span>
          </div>

          <div className="flex items-center gap-2">
            {onLocateUser && (
              <button
                onClick={onLocateUser}
                disabled={isLocating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  userLocationActive
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950"
                    : "bg-slate-900 border-sky-500/50 hover:border-sky-400 text-sky-300 hover:text-white"
                }`}
                title="Detect live browser GPS & relocate company GIS around your exact position"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span className="hidden md:inline">
                  {isLocating
                    ? "Locating..."
                    : userLocationActive
                    ? "My Location Active"
                    : "Use My Location"}
                </span>
              </button>
            )}

            <button
              onClick={onToggleGeoprocessing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isGeoprocessingOpen
                  ? "bg-sky-950 border-sky-500 text-sky-300"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Analysis</span>
            </button>

            <button
              onClick={onToggleAIAssistant}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isAIAssistantOpen
                  ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            <button
              onClick={onOpenPrinter}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
              title="Print / Export Composition"
            >
              <Printer className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Map Sub-Toolbar (Only Visible on 'map' view) */}
      {activePageView === "map" && (
        <div className="h-9 bg-slate-900/90 border-t border-slate-800/80 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2">
              Spatial Tools:
            </span>
            <button
              onClick={() => onSelectTool("select")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition ${
                activeTool === "select" || activeTool === "identify"
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MousePointer className="w-3 h-3" />
              <span>Select / Inspect</span>
            </button>

            <button
              onClick={() => onSelectTool("measure_distance")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition ${
                activeTool === "measure_distance"
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Ruler className="w-3 h-3" />
              <span>Distance</span>
            </button>

            <button
              onClick={() => onSelectTool("measure_area")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition ${
                activeTool === "measure_area"
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Square className="w-3 h-3" />
              <span>Area</span>
            </button>

            <button
              onClick={() => onSelectTool("draw_point")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition ${
                activeTool === "draw_point"
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Add Point</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleOfficeLocator}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                isOfficeLocatorOpen
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              <Building2 className="w-3 h-3 text-emerald-400" />
              <span>Office Directory Drawer</span>
            </button>

            <button
              onClick={onToggleBoundaryRedraw}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                isBoundaryRedrawOpen
                  ? "bg-amber-950 border-amber-500 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Boundary Redraw Drawer</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


