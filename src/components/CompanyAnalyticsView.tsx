import React from "react";
import {
  BarChart3,
  Building2,
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  Users,
  Ruler,
  Compass,
  Zap,
  MapPin
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from "recharts";
import type { GISLayer } from "../types/gis";

interface CompanyAnalyticsViewProps {
  layers: GISLayer[];
  onNavigateToMap: () => void;
  onFocusOffice: (lat: number, lng: number, title: string) => void;
}

export const CompanyAnalyticsView: React.FC<CompanyAnalyticsViewProps> = ({
  layers,
  onNavigateToMap,
  onFocusOffice
}) => {
  // Extract layers
  const buildingLayer = layers.find((l) => l.id === "layer_company_buildings");
  const officeLayer = layers.find((l) => l.id === "layer_company_offices");
  const boundaryLayer = layers.find((l) => l.id === "layer_company_boundary");

  const buildings = buildingLayer?.data?.features || [];
  const offices = officeLayer?.data?.features || [];
  const boundaries = boundaryLayer?.data?.features || [];

  // Building Occupancy & Capacity Data
  const buildingOccupancyData = buildings.map((b) => ({
    name: b.properties?.building_code || "Bldg",
    fullName: b.properties?.building_name || "Building",
    occupancy: b.properties?.occupancy || 0,
    offices: b.properties?.office_count || 0,
    type: b.properties?.building_type || "General"
  }));

  // Department Distribution for Pie Chart
  const deptCounts: Record<string, number> = {};
  offices.forEach((o) => {
    const dept = o.properties?.department || "General Administration";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const deptChartData = Object.entries(deptCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#10b981", "#38bdf8", "#818cf8", "#f59e0b", "#ec4899", "#14b8a6"];

  const totalOccupancy = buildings.reduce(
    (acc, b) => acc + (b.properties?.occupancy || 0),
    0
  );
  const totalArea = boundaries.reduce(
    (acc, b) => acc + (b.properties?.total_area_sqft || 0),
    0
  );

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-bold tracking-tight">
              Company Spatial Intelligence & GIS Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytical insights on corporate grounds, facility distribution, building capacities, and department footprint.
          </p>
        </div>

        <button
          onClick={onNavigateToMap}
          className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow transition"
        >
          <Compass className="w-4 h-4" />
          <span>Launch Spatial GIS Map</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-sky-950 text-sky-400 rounded-lg border border-sky-800/50">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Campus Area
            </div>
            <div className="text-lg font-bold text-slate-100">
              {totalArea.toLocaleString()} sq ft
            </div>
            <div className="text-[10px] text-sky-400 mt-0.5">2 Official GIS Zones</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800/50">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Buildings
            </div>
            <div className="text-lg font-bold text-slate-100">{buildings.length} Complexes</div>
            <div className="text-[10px] text-indigo-400 mt-0.5">Admin, R&D, Data Center</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/50">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Campus Occupancy
            </div>
            <div className="text-lg font-bold text-slate-100">{totalOccupancy} Personnel</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Active On-Site Staff</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-950 text-amber-400 rounded-lg border border-amber-800/50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Security Level
            </div>
            <div className="text-lg font-bold text-slate-100">High Protection</div>
            <div className="text-[10px] text-amber-400 mt-0.5">NOC & Perimeter Active</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Building Occupancy Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>Building Personnel Occupancy & Capacity</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Staff distribution across registered company buildings
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="occupancy" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Occupancy" />
                <Bar dataKey="offices" fill="#818cf8" radius={[4, 4, 0, 0]} name="Offices/Rooms" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Share Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                <span>Department Facility Distribution</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Share of company offices and designated spaces by department
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name.split(" ")[0]} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                >
                  {deptChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Buildings Directory Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Company Department Buildings & Complexes</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Detailed breakdown of floors, occupancy, department heads, and extensions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Building Name</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Head of Dept</th>
                <th className="p-2.5">Floors</th>
                <th className="p-2.5">Occupancy</th>
                <th className="p-2.5">Extension</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {buildings.map((b) => {
                const props = b.properties || {};
                const geom = b.geometry as any;
                const ring = geom?.coordinates?.[0] || [];
                const bLat = ring[0]?.[1] || 6.428;
                const bLng = ring[0]?.[0] || 3.422;

                return (
                  <tr key={b.id} className="hover:bg-slate-800/50">
                    <td className="p-2.5 font-mono text-sky-400 font-bold">
                      {props.building_code}
                    </td>
                    <td className="p-2.5 font-medium text-slate-100">
                      {props.building_name}
                    </td>
                    <td className="p-2.5 text-slate-300">{props.department}</td>
                    <td className="p-2.5 text-slate-300">{props.head_of_dept}</td>
                    <td className="p-2.5 font-mono">{props.floors}</td>
                    <td className="p-2.5 font-mono text-emerald-400">
                      {props.occupancy} Staff
                    </td>
                    <td className="p-2.5 font-mono text-amber-400">Ext {props.phone_ext}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => {
                          onNavigateToMap();
                          onFocusOffice(bLat, bLng, props.building_name);
                        }}
                        className="text-[11px] bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white px-2.5 py-1 rounded transition flex items-center gap-1 ml-auto"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Locate</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
