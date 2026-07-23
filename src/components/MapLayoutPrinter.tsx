import React, { useState } from "react";
import { Printer, Compass, FileText, Download, X, Layers } from "lucide-react";
import type { GISLayer, BasemapType } from "../types/gis";

interface MapLayoutPrinterProps {
  layers: GISLayer[];
  selectedBasemap: BasemapType;
  onClose: () => void;
}

export const MapLayoutPrinter: React.FC<MapLayoutPrinterProps> = ({
  layers,
  selectedBasemap,
  onClose
}) => {
  const [mapTitle, setMapTitle] = useState("San Francisco Bay Area Regional GIS Analysis");
  const [mapSubtitle, setMapSubtitle] = useState("Emergency Infrastructure & Environmental Hazard Zoning Map");
  const [authorName, setAuthorName] = useState("Lead GIS Cartographer & Spatial Analyst");

  const activeLayers = layers.filter((l) => l.visible);
  const totalFeatures = activeLayers.reduce((acc, l) => acc + l.featureCount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[2500] p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-sm text-slate-100">
              Cartographic Map Composition & Layout Export
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-3 gap-6 bg-slate-900">
          {/* Settings Panel */}
          <div className="space-y-4 text-xs text-slate-300">
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider">
              Layout Composition Settings
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Map Title:</label>
              <input
                type="text"
                value={mapTitle}
                onChange={(e) => setMapTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Subtitle / Purpose:</label>
              <input
                type="text"
                value={mapSubtitle}
                onChange={(e) => setMapSubtitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Author / Agency:</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handlePrint}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Layout PDF</span>
              </button>
            </div>
          </div>

          {/* Cartographic Sheet Preview Frame */}
          <div className="col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner flex flex-col justify-between aspect-[4/3] relative">
            {/* Map Sheet Title Block */}
            <div className="border-b-2 border-sky-500 pb-3">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">{mapTitle}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{mapSubtitle}</p>
            </div>

            {/* Simulated Canvas Frame */}
            <div className="flex-1 bg-slate-900/80 my-3 rounded border border-slate-800 relative overflow-hidden flex items-center justify-center p-4 text-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="z-10 text-slate-400 text-xs space-y-1">
                <Layers className="w-8 h-8 mx-auto text-sky-400 opacity-80 mb-1" />
                <p className="font-semibold text-slate-300">Live Spatial Canvas Extent</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {activeLayers.length} Active Vector Layers • {totalFeatures} Geometries Rendered
                </p>
              </div>

              {/* North Arrow Widget */}
              <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-700 p-2 rounded flex flex-col items-center">
                <Compass className="w-6 h-6 text-sky-400 animate-bounce" />
                <span className="text-[10px] font-bold text-slate-300 mt-0.5">N</span>
              </div>

              {/* Legend Box */}
              <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-800 p-2.5 rounded text-left max-w-xs shadow-xl text-[10px]">
                <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1.5 uppercase">
                  Map Legend
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {activeLayers.map((l) => (
                    <div key={l.id} className="flex items-center gap-2 text-slate-300">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: l.style.fillColor || l.style.color }}
                      />
                      <span className="truncate">{l.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sheet Footer Metadata */}
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div>Cartographer: {authorName}</div>
              <div>CRS: EPSG:4326 (WGS84)</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
