import { GISLayer } from "../types/gis";

// Company Headquarters & Regional GIS Datasets (Nigeria - Victoria Island, Lagos & National Hubs)
export const SAMPLE_GIS_LAYERS: GISLayer[] = [
  {
    id: "layer_company_boundary",
    name: "Afriland Corporate HQ Perimeter & GIS Boundary",
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.75,
    featureCount: 2,
    createdAt: new Date().toISOString(),
    category: "Company Corporate GIS",
    style: {
      color: "#38bdf8",
      fillColor: "#0284c7",
      fillOpacity: 0.25,
      weight: 3,
      dashArray: "6,6",
      pointRadius: 6,
      symbologyType: "single",
      showLabels: true,
      labelField: "boundary_name",
      labelColor: "#38bdf8"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "comp_bound_1",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.412, 6.422],
              [3.432, 6.422],
              [3.432, 6.435],
              [3.412, 6.435],
              [3.412, 6.422]
            ]]
          },
          properties: {
            boundary_id: "HQ-PERIMETER-01",
            boundary_name: "Afriland Corporate HQ Campus Perimeter (Victoria Island)",
            total_area_sqft: 185000,
            security_level: "High - Restricted Access",
            head_of_company: "Engr. Olumide Adeleke (Group CEO)",
            last_redrawn: "2026-07-01",
            redraw_authority: "Executive Board",
            status: "Official Active Boundary"
          }
        },
        {
          type: "Feature",
          id: "comp_bound_2",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.432, 6.422],
              [3.450, 6.422],
              [3.450, 6.435],
              [3.432, 6.435],
              [3.432, 6.422]
            ]]
          },
          properties: {
            boundary_id: "HQ-EXPANSION-02",
            boundary_name: "Lekki Peninsula Tech & Energy Expansion Belt",
            total_area_sqft: 95000,
            security_level: "Medium - Construction Zone",
            head_of_company: "Engr. Olumide Adeleke (Group CEO)",
            last_redrawn: "2026-05-15",
            redraw_authority: "Executive Board",
            status: "Proposed Expansion Boundary"
          }
        }
      ]
    }
  },
  {
    id: "layer_company_buildings",
    name: "Company Department Buildings & Complexes",
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.8,
    featureCount: 5,
    createdAt: new Date().toISOString(),
    category: "Company Corporate GIS",
    style: {
      color: "#818cf8",
      fillColor: "#4f46e5",
      fillOpacity: 0.5,
      weight: 2,
      pointRadius: 6,
      symbologyType: "categorized",
      targetField: "building_type",
      showLabels: true,
      labelField: "building_name",
      labelColor: "#c7d2fe"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "bldg_a",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.418, 6.428],
              [3.424, 6.428],
              [3.424, 6.432],
              [3.418, 6.432],
              [3.418, 6.428]
            ]]
          },
          properties: {
            building_code: "BLDG-A",
            building_name: "Afriland Executive Tower & Governance Suite",
            department: "Executive Management & Legal",
            building_type: "Administrative",
            head_of_dept: "Engr. Olumide Adeleke",
            floors: 12,
            office_count: 24,
            occupancy: 85,
            phone_ext: 1000
          }
        },
        {
          type: "Feature",
          id: "bldg_b",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.425, 6.428],
              [3.430, 6.428],
              [3.430, 6.432],
              [3.425, 6.432],
              [3.425, 6.428]
            ]]
          },
          properties: {
            building_code: "BLDG-B",
            building_name: "Danbaba Engineering & AI R&D Innovation Hub",
            department: "Software & Systems R&D",
            building_type: "Engineering",
            head_of_dept: "Dr. Amina Bello (CTO)",
            floors: 8,
            office_count: 52,
            occupancy: 210,
            phone_ext: 3000
          }
        },
        {
          type: "Feature",
          id: "bldg_c",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.418, 6.423],
              [3.424, 6.423],
              [3.424, 6.427],
              [3.418, 6.427],
              [3.418, 6.423]
            ]]
          },
          properties: {
            building_code: "BLDG-C",
            building_name: "West Africa Operations & HR Headquarters",
            department: "Operations, HR & Finance",
            building_type: "Operations",
            head_of_dept: "Chief Emeka Okafor (VP HR)",
            floors: 6,
            office_count: 36,
            occupancy: 140,
            phone_ext: 2000
          }
        },
        {
          type: "Feature",
          id: "bldg_d",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.425, 6.423],
              [3.430, 6.423],
              [3.430, 6.427],
              [3.425, 6.427],
              [3.425, 6.423]
            ]]
          },
          properties: {
            building_code: "BLDG-D",
            building_name: "Lagos Primary Data Center & Fiber NOC",
            department: "IT Infrastructure & Security",
            building_type: "Data Center",
            head_of_dept: "Folake Adeniyi (CIO)",
            floors: 3,
            office_count: 12,
            occupancy: 35,
            phone_ext: 1001
          }
        },
        {
          type: "Feature",
          id: "bldg_e",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.421, 6.426],
              [3.427, 6.426],
              [3.427, 6.428],
              [3.421, 6.428],
              [3.421, 6.426]
            ]]
          },
          properties: {
            building_code: "BLDG-E",
            building_name: "Eko Cafeteria, Suya Lounge & Wellness Hub",
            department: "Facilities & Wellness",
            building_type: "Amenities",
            head_of_dept: "Chidi Nwachukwu",
            floors: 2,
            office_count: 8,
            occupancy: 300,
            phone_ext: 4000
          }
        }
      ]
    }
  },
  {
    id: "layer_company_offices",
    name: "Company Offices, Rooms & Features Directory",
    type: "vector",
    geometryType: "Point",
    visible: true,
    opacity: 0.95,
    featureCount: 8,
    createdAt: new Date().toISOString(),
    category: "Company Corporate GIS",
    style: {
      color: "#ffffff",
      fillColor: "#10b981",
      fillOpacity: 0.9,
      weight: 2,
      pointRadius: 8,
      symbologyType: "single",
      showLabels: true,
      labelField: "office_title",
      labelColor: "#a7f3d0"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "office_1",
          geometry: { type: "Point", coordinates: [3.421, 6.430] },
          properties: {
            room_number: "Room 501",
            office_title: "CEO & Executive Boardroom",
            department: "Executive Management",
            head_of_office: "Engr. Olumide Adeleke (Group CEO)",
            extension: "1001",
            capacity: 20,
            status: "Available for Meetings",
            hvac_temp: "22°C",
            building: "Executive Tower - Floor 12"
          }
        },
        {
          type: "Feature",
          id: "office_2",
          geometry: { type: "Point", coordinates: [3.428, 6.430] },
          properties: {
            room_number: "Room 302",
            office_title: "Software & AI Engineering Lab",
            department: "Engineering R&D",
            head_of_office: "Dr. Amina Bello (CTO)",
            extension: "3002",
            capacity: 45,
            status: "High Productivity Zone",
            hvac_temp: "20°C",
            building: "Danbaba Innovation Hub - Floor 3"
          }
        },
        {
          type: "Feature",
          id: "office_3",
          geometry: { type: "Point", coordinates: [3.421, 6.425] },
          properties: {
            room_number: "Room 204",
            office_title: "Human Resources & Payroll Office",
            department: "Human Resources",
            head_of_office: "Chief Emeka Okafor",
            extension: "2004",
            capacity: 15,
            status: "Open Hours 8am - 5pm WAT",
            hvac_temp: "23°C",
            building: "Operations HQ - Floor 2"
          }
        },
        {
          type: "Feature",
          id: "office_4",
          geometry: { type: "Point", coordinates: [3.423, 6.425] },
          properties: {
            room_number: "Room 210",
            office_title: "Finance & Corporate Audit Suite",
            department: "Finance",
            head_of_office: "Mrs. Zainab Abubakar (CFO)",
            extension: "2010",
            capacity: 18,
            status: "Restricted Access",
            hvac_temp: "21°C",
            building: "Operations HQ - Floor 2"
          }
        },
        {
          type: "Feature",
          id: "office_5",
          geometry: { type: "Point", coordinates: [3.427, 6.425] },
          properties: {
            room_number: "Room 101",
            office_title: "Primary Mainframe & Server NOC",
            department: "IT Operations",
            head_of_office: "Folake Adeniyi",
            extension: "1001",
            capacity: 8,
            status: "Biometric Security Active",
            hvac_temp: "18°C (Precision AC Active)",
            building: "Lagos Data Center - Floor 1"
          }
        },
        {
          type: "Feature",
          id: "office_6",
          geometry: { type: "Point", coordinates: [3.414, 6.422] },
          properties: {
            room_number: "Gate GSOC-1",
            office_title: "West Africa Security Operations Center",
            department: "Corporate Security",
            head_of_office: "Captain Babatunde Raji",
            extension: "1000",
            capacity: 10,
            status: "24/7 Active Monitoring",
            hvac_temp: "22°C",
            building: "Victoria Island Main Gate"
          }
        },
        {
          type: "Feature",
          id: "office_7",
          geometry: { type: "Point", coordinates: [3.424, 6.427] },
          properties: {
            room_number: "Room CAFE-1",
            office_title: "Eko Executive Dining & Lounge",
            department: "Facilities & Amenities",
            head_of_office: "Chef Ibrahim",
            extension: "4001",
            capacity: 150,
            status: "Lunch Served 12:00 - 15:00",
            hvac_temp: "22°C",
            building: "Wellness Hub - Floor 1"
          }
        },
        {
          type: "Feature",
          id: "office_8",
          geometry: { type: "Point", coordinates: [3.419, 6.431] },
          properties: {
            room_number: "Reception Desk",
            office_title: "Victoria Island Main Campus Reception",
            department: "Administration",
            head_of_office: "Blessing Okon",
            extension: "1002",
            capacity: 25,
            status: "Visitor Badge Issuance",
            hvac_temp: "22°C",
            building: "Executive Tower Lobby"
          }
        }
      ]
    }
  },
  {
    id: "layer_hospitals_sf",
    name: "Emergency Healthcare & Hospitals (Lagos, Nigeria)",
    type: "vector",
    geometryType: "Point",
    visible: true,
    opacity: 0.95,
    featureCount: 8,
    createdAt: new Date().toISOString(),
    category: "Public Health",
    style: {
      color: "#ffffff",
      fillColor: "#ef4444",
      fillOpacity: 0.9,
      weight: 2,
      pointRadius: 8,
      symbologyType: "single",
      showLabels: true,
      labelField: "hospital_name",
      labelColor: "#fca5a5"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "hosp_1",
          geometry: { type: "Point", coordinates: [3.420, 6.430] },
          properties: {
            id: 101,
            hospital_name: "Reddington Hospital - Victoria Island",
            trauma_level: "Level I",
            bed_capacity: 120,
            emergency_beds: 25,
            status: "Active 24/7",
            helipad: true,
            occupancy_pct: 82.5
          }
        },
        {
          type: "Feature",
          id: "hosp_2",
          geometry: { type: "Point", coordinates: [3.428, 6.445] },
          properties: {
            id: 102,
            hospital_name: "First Cardiology Consultants - Ikoyi",
            trauma_level: "Level I Specialist",
            bed_capacity: 85,
            emergency_beds: 18,
            status: "Active 24/7",
            helipad: false,
            occupancy_pct: 88.2
          }
        },
        {
          type: "Feature",
          id: "hosp_3",
          geometry: { type: "Point", coordinates: [3.395, 6.452] },
          properties: {
            id: 103,
            hospital_name: "St. Nicholas Hospital - Lagos Island",
            trauma_level: "Level II",
            bed_capacity: 100,
            emergency_beds: 20,
            status: "Active 24/7",
            helipad: false,
            occupancy_pct: 74.0
          }
        },
        {
          type: "Feature",
          id: "hosp_4",
          geometry: { type: "Point", coordinates: [3.460, 6.440] },
          properties: {
            id: 104,
            hospital_name: "Evercare Hospital - Lekki Phase 1",
            trauma_level: "Level I Tertiary",
            bed_capacity: 165,
            emergency_beds: 30,
            status: "Active 24/7",
            helipad: true,
            occupancy_pct: 85.0
          }
        },
        {
          type: "Feature",
          id: "hosp_5",
          geometry: { type: "Point", coordinates: [3.432, 6.448] },
          properties: {
            id: 105,
            hospital_name: "Lagoon Hospital - Ikoyi",
            trauma_level: "Level II",
            bed_capacity: 90,
            emergency_beds: 15,
            status: "Active 24/7",
            helipad: false,
            occupancy_pct: 69.4
          }
        },
        {
          type: "Feature",
          id: "hosp_6",
          geometry: { type: "Point", coordinates: [3.355, 6.520] },
          properties: {
            id: 106,
            hospital_name: "Lagos University Teaching Hospital (LUTH)",
            trauma_level: "National Referral Level I",
            bed_capacity: 760,
            emergency_beds: 80,
            status: "Active 24/7",
            helipad: true,
            occupancy_pct: 91.1
          }
        },
        {
          type: "Feature",
          id: "hosp_7",
          geometry: { type: "Point", coordinates: [3.348, 6.595] },
          properties: {
            id: 107,
            hospital_name: "The Eko Hospital - Ikeja",
            trauma_level: "Level II Specialist",
            bed_capacity: 130,
            emergency_beds: 22,
            status: "Active 24/7",
            helipad: false,
            occupancy_pct: 78.2
          }
        },
        {
          type: "Feature",
          id: "hosp_8",
          geometry: { type: "Point", coordinates: [3.422, 6.428] },
          properties: {
            id: 108,
            hospital_name: "Paelon Memorial Hospital - VI",
            trauma_level: "Community Specialist",
            bed_capacity: 60,
            emergency_beds: 12,
            status: "Active 24/7",
            helipad: false,
            occupancy_pct: 70.0
          }
        }
      ]
    }
  },
  {
    id: "layer_transit_corridors",
    name: "Lagos Metro Rail & Arterial Corridors",
    type: "vector",
    geometryType: "LineString",
    visible: true,
    opacity: 0.9,
    featureCount: 4,
    createdAt: new Date().toISOString(),
    category: "Infrastructure",
    style: {
      color: "#06b6d4",
      fillColor: "#06b6d4",
      fillOpacity: 0.5,
      weight: 4,
      pointRadius: 5,
      symbologyType: "single",
      showLabels: true,
      labelField: "line_name",
      labelColor: "#a5f3fc"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "line_1",
          geometry: {
            type: "LineString",
            coordinates: [
              [3.350, 6.460],
              [3.380, 6.455],
              [3.395, 6.452],
              [3.415, 6.435],
              [3.428, 6.428]
            ]
          },
          properties: {
            line_id: "LAMATA-BLUE",
            line_name: "Lagos Blue Line Metro (Mile 2 to Marina)",
            daily_ridership: 175000,
            frequency_mins: 4,
            electrified: true,
            speed_limit_kmh: 80
          }
        },
        {
          type: "Feature",
          id: "line_2",
          geometry: {
            type: "LineString",
            coordinates: [
              [3.345, 6.600],
              [3.360, 6.540],
              [3.380, 6.480],
              [3.395, 6.452]
            ]
          },
          properties: {
            line_id: "LAMATA-RED",
            line_name: "Lagos Red Line Rail Spine (Ikeja to Agbado - Marina)",
            daily_ridership: 220000,
            frequency_mins: 5,
            electrified: true,
            speed_limit_kmh: 90
          }
        },
        {
          type: "Feature",
          id: "line_3",
          geometry: {
            type: "LineString",
            coordinates: [
              [3.415, 6.432],
              [3.445, 6.435],
              [3.480, 6.440],
              [3.530, 6.450]
            ]
          },
          properties: {
            line_id: "LEKKI-EPE-EXP",
            line_name: "Lekki-Epe Expressway Express Corridor",
            daily_ridership: 110000,
            frequency_mins: 3,
            electrified: false,
            speed_limit_kmh: 70
          }
        },
        {
          type: "Feature",
          id: "line_4",
          geometry: {
            type: "LineString",
            coordinates: [
              [3.385, 6.500],
              [3.390, 6.475],
              [3.395, 6.455],
              [3.415, 6.435]
            ]
          },
          properties: {
            line_id: "3RD-MAINLAND",
            line_name: "Third Mainland Bridge Rapid Transit Arterial",
            daily_ridership: 310000,
            frequency_mins: 2,
            electrified: false,
            speed_limit_kmh: 80
          }
        }
      ]
    }
  },
  {
    id: "layer_zoning_districts",
    name: "Urban Planning Zoning Districts (Lagos State)",
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.65,
    featureCount: 5,
    createdAt: new Date().toISOString(),
    category: "Land Use",
    style: {
      color: "#f59e0b",
      fillColor: "#f59e0b",
      fillOpacity: 0.45,
      weight: 2,
      pointRadius: 6,
      symbologyType: "categorized",
      targetField: "zone_type",
      showLabels: true,
      labelField: "district_name",
      labelColor: "#fef08a"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "zone_cbd",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.412, 6.422],
              [3.435, 6.422],
              [3.435, 6.438],
              [3.412, 6.438],
              [3.412, 6.422]
            ]]
          },
          properties: {
            district_name: "Victoria Island Financial & Tech Hub",
            zone_code: "VI-CBD-1",
            zone_type: "Commercial Core",
            max_height_m: 220,
            far_ratio: 12.0,
            est_population: 32000,
            property_tax_tier: "Tier 1 Prime"
          }
        },
        {
          type: "Feature",
          id: "zone_mission",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.420, 6.440],
              [3.450, 6.440],
              [3.450, 6.458],
              [3.420, 6.458],
              [3.420, 6.440]
            ]]
          },
          properties: {
            district_name: "Ikoyi Residential & Diplomatic Reserve",
            zone_code: "IKY-RES-2",
            zone_type: "Mixed Use High Density",
            max_height_m: 60,
            far_ratio: 4.5,
            est_population: 28000,
            property_tax_tier: "Tier 1 Prime"
          }
        },
        {
          type: "Feature",
          id: "zone_richmond",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.435, 6.422],
              [3.480, 6.422],
              [3.480, 6.445],
              [3.435, 6.445],
              [3.435, 6.422]
            ]]
          },
          properties: {
            district_name: "Lekki Peninsula Mixed Commercial Corridor",
            zone_code: "LKK-MIX-1",
            zone_type: "Commercial Core",
            max_height_m: 45,
            far_ratio: 3.8,
            est_population: 85000,
            property_tax_tier: "Tier 2"
          }
        },
        {
          type: "Feature",
          id: "zone_soma_tech",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.335, 6.585],
              [3.360, 6.585],
              [3.360, 6.605],
              [3.335, 6.605],
              [3.335, 6.585]
            ]]
          },
          properties: {
            district_name: "Ikeja Tech Village & Commercial Hub",
            zone_code: "IKJ-TECH",
            zone_type: "Commercial Core",
            max_height_m: 80,
            far_ratio: 6.0,
            est_population: 120000,
            property_tax_tier: "Tier 2"
          }
        },
        {
          type: "Feature",
          id: "zone_presidio_park",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.520, 6.430],
              [3.550, 6.430],
              [3.550, 6.450],
              [3.520, 6.450],
              [3.520, 6.430]
            ]]
          },
          properties: {
            district_name: "Lekki Conservation Centre Reserve",
            zone_code: "LCC-PARK",
            zone_type: "Protected Open Space",
            max_height_m: 10,
            far_ratio: 0.1,
            est_population: 1500,
            property_tax_tier: "Exempt"
          }
        }
      ]
    }
  },
  {
    id: "layer_environmental_hazards",
    name: "Flood Inundation & Coastal Risk Zones (Lagos)",
    type: "vector",
    geometryType: "Polygon",
    visible: true,
    opacity: 0.55,
    featureCount: 3,
    createdAt: new Date().toISOString(),
    category: "Hazards",
    style: {
      color: "#dc2626",
      fillColor: "#ea580c",
      fillOpacity: 0.5,
      weight: 2,
      pointRadius: 6,
      symbologyType: "choropleth",
      targetField: "risk_score",
      colorScheme: ["#fef08a", "#f97316", "#dc2626"],
      showLabels: true,
      labelField: "zone_alias",
      labelColor: "#fecaca"
    },
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "hazard_1",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.412, 6.418],
              [3.435, 6.418],
              [3.435, 6.425],
              [3.412, 6.425],
              [3.412, 6.418]
            ]]
          },
          properties: {
            zone_alias: "Victoria Island Atlantic Surge Zone",
            hazard_type: "Coastal Surge & Tidal Inundation",
            risk_score: 88,
            risk_level: "High",
            last_event_year: 2024,
            building_count: 1420
          }
        },
        {
          type: "Feature",
          id: "hazard_2",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.435, 6.420],
              [3.470, 6.420],
              [3.470, 6.430],
              [3.435, 6.430],
              [3.435, 6.420]
            ]]
          },
          properties: {
            zone_alias: "Lekki Lagoon Wetland Inundation Zone",
            hazard_type: "Lagoon Overflow & Rain Surge",
            risk_score: 95,
            risk_level: "Critical",
            last_event_year: 2025,
            building_count: 890
          }
        },
        {
          type: "Feature",
          id: "hazard_3",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [3.390, 6.445],
              [3.420, 6.445],
              [3.420, 6.460],
              [3.390, 6.460],
              [3.390, 6.445]
            ]]
          },
          properties: {
            zone_alias: "Lagos Island Waterfront Coastal Erosion Zone",
            hazard_type: "Erosion & Seasonal Flash Flooding",
            risk_score: 64,
            risk_level: "Moderate",
            last_event_year: 2023,
            building_count: 3200
          }
        }
      ]
    }
  }
];
