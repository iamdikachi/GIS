import React, { useState, useEffect } from "react";
import type {
  GISLayer,
  BasemapType,
  SpatialToolMode,
  MapCoordinates,
  MeasurementResult,
  ElevationPoint,
  LayerStyle
} from "./types/gis";
import { SAMPLE_GIS_LAYERS } from "./data/sampleDatasets";
import { generateElevationProfile } from "./utils/gisEngine";
import { relocateLayersToCoordinates, createUserLocationLayer } from "./utils/geolocationHelper";
import { MapCanvas } from "./components/MapCanvas";
import { LayerTableOfContents } from "./components/LayerTableOfContents";
import { AttributeTable } from "./components/AttributeTable";
import { GeoprocessingToolbar } from "./components/GeoprocessingToolbar";
import { AIGeospatialAnalyst } from "./components/AIGeospatialAnalyst";
import { CompanyOfficeLocator } from "./components/CompanyOfficeLocator";
import { BoundaryRedrawTool } from "./components/BoundaryRedrawTool";
import { CompanyAnalyticsView } from "./components/CompanyAnalyticsView";
import { CompanyDatasetsView } from "./components/CompanyDatasetsView";
import { LandingPage } from "./components/LandingPage";
import { SymbologyModal } from "./components/SymbologyModal";
import { MapLayoutPrinter } from "./components/MapLayoutPrinter";
import { GISHeader, ActivePageView } from "./components/GISHeader";

export default function App() {
  // Navigation & Page State
  const [activePageView, setActivePageView] = useState<ActivePageView>("landing");

  // Primary State
  const [layers, setLayers] = useState<GISLayer[]>(SAMPLE_GIS_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(
    SAMPLE_GIS_LAYERS[0]?.id || null
  );
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapType>("carto_dark");
  const [activeTool, setActiveTool] = useState<SpatialToolMode>("select");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Geolocation & User Positioning State
  const [isLocating, setIsLocating] = useState(false);
  const [userLocationActive, setUserLocationActive] = useState(false);

  // Drawer & Modal States
  const [isGeoprocessingOpen, setIsGeoprocessingOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isOfficeLocatorOpen, setIsOfficeLocatorOpen] = useState(false);
  const [isBoundaryRedrawOpen, setIsBoundaryRedrawOpen] = useState(false);
  const [isAttributeTableOpen, setIsAttributeTableOpen] = useState(false);
  const [attributeLayerId, setAttributeLayerId] = useState<string | null>(null);
  const [styleLayer, setStyleLayer] = useState<GISLayer | null>(null);
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);

  // Realtime Map Metrics State
  const [coordinates, setCoordinates] = useState<MapCoordinates>({
    lat: 6.4281,
    lng: 3.4219,
    zoom: 14
  });
  const [measurementResult, setMeasurementResult] = useState<MeasurementResult | null>(null);
  const [elevationProfileData, setElevationProfileData] = useState<ElevationPoint[]>([]);

  // Geolocation trigger handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        setLayers((prevLayers) => {
          // Remove existing user location pin layer if present
          const cleanLayers = prevLayers.filter((l) => l.id !== "layer_user_current_location");
          // Relocate remaining base layers to user coordinates
          const shiftedLayers = relocateLayersToCoordinates(cleanLayers, userLat, userLng);
          // Add explicit live user pin layer
          const userPinLayer = createUserLocationLayer(userLat, userLng);
          return [userPinLayer, ...shiftedLayers];
        });

        setCoordinates({
          lat: Number(userLat.toFixed(5)),
          lng: Number(userLng.toFixed(5)),
          zoom: 16
        });

        setUserLocationActive(true);
        setIsLocating(false);
      },
      (error) => {
        console.warn("Geolocation request failure:", error.message);
        setIsLocating(false);
        // Silently handle denied or prompt user if manually requested
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Attempt automatic geolocation detection on initial mount
  useEffect(() => {
    handleLocateUser();
  }, []);

  // Handlers
  const handleAddLayer = (newLayer: GISLayer) => {
    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
  };

  const handleUpdateBoundaryLayer = (updatedLayer: GISLayer) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === updatedLayer.id ? updatedLayer : l))
    );
  };

  const handleRemoveLayer = (layerId: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    if (activeLayerId === layerId) {
      setActiveLayerId(layers.find((l) => l.id !== layerId)?.id || null);
    }
  };

  const handleToggleVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleChangeOpacity = (layerId: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, opacity } : l))
    );
  };

  const handleSaveStyle = (layerId: string, newStyle: LayerStyle) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, style: newStyle } : l))
    );
  };

  const handleOpenAttributeTable = (layerId: string) => {
    setAttributeLayerId(layerId);
    setIsAttributeTableOpen(true);
  };

  const handleFocusOffice = (lat: number, lng: number, officeTitle: string) => {
    setCoordinates({
      lat,
      lng,
      zoom: 16
    });
    setActivePageView("map");
  };

  const handleUpdateFeatureProperties = (
    layerId: string,
    featureId: string,
    updatedProps: Record<string, any>
  ) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== layerId) return layer;

        const updatedFeatures = layer.data.features.map((feat, idx) => {
          const fId = String(feat.id || feat.properties?.id || idx);
          if (fId === featureId) {
            return {
              ...feat,
              properties: updatedProps
            };
          }
          return feat;
        });

        return {
          ...layer,
          data: {
            ...layer.data,
            features: updatedFeatures
          }
        };
      })
    );
  };

  const handleAddField = (layerId: string, fieldName: string, defaultValue: any) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== layerId) return layer;

        const updatedFeatures = layer.data.features.map((feat) => ({
          ...feat,
          properties: {
            ...(feat.properties || {}),
            [fieldName]: defaultValue
          }
        }));

        return {
          ...layer,
          data: {
            ...layer.data,
            features: updatedFeatures
          }
        };
      })
    );
  };

  const handleAddUserFeature = (feature: any) => {
    let targetLayer = layers.find((l) => l.id === activeLayerId);

    if (!targetLayer) {
      const drawingLayer: GISLayer = {
        id: `user_drawings_${Date.now()}`,
        name: "Custom User Annotations",
        type: "vector",
        geometryType: "Point",
        visible: true,
        opacity: 0.9,
        featureCount: 1,
        createdAt: new Date().toISOString(),
        category: "User Layer",
        style: {
          color: "#ffffff",
          fillColor: "#0284c7",
          fillOpacity: 0.9,
          weight: 2,
          pointRadius: 8,
          symbologyType: "single"
        },
        data: {
          type: "FeatureCollection",
          features: [feature]
        }
      };
      handleAddLayer(drawingLayer);
    } else {
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== targetLayer!.id) return l;
          return {
            ...l,
            featureCount: l.featureCount + 1,
            data: {
              ...l.data,
              features: [...l.data.features, feature]
            }
          };
        })
      );
    }
  };

  const handleLineDrawnForElevation = (lineCoords: [number, number][]) => {
    const profile = generateElevationProfile(lineCoords);
    setElevationProfileData(profile);
    setIsGeoprocessingOpen(true);
  };

  const currentAttributeLayer = layers.find((l) => l.id === attributeLayerId);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Navigation Header */}
      <GISHeader
        activePageView={activePageView}
        onSelectPageView={setActivePageView}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        isGeoprocessingOpen={isGeoprocessingOpen}
        onToggleGeoprocessing={() => {
          setIsGeoprocessingOpen(!isGeoprocessingOpen);
          setIsAIAssistantOpen(false);
          setIsOfficeLocatorOpen(false);
          setIsBoundaryRedrawOpen(false);
        }}
        isAIAssistantOpen={isAIAssistantOpen}
        onToggleAIAssistant={() => {
          setIsAIAssistantOpen(!isAIAssistantOpen);
          setIsGeoprocessingOpen(false);
          setIsOfficeLocatorOpen(false);
          setIsBoundaryRedrawOpen(false);
        }}
        isOfficeLocatorOpen={isOfficeLocatorOpen}
        onToggleOfficeLocator={() => {
          setIsOfficeLocatorOpen(!isOfficeLocatorOpen);
          setIsGeoprocessingOpen(false);
          setIsAIAssistantOpen(false);
          setIsBoundaryRedrawOpen(false);
        }}
        isBoundaryRedrawOpen={isBoundaryRedrawOpen}
        onToggleBoundaryRedraw={() => {
          setIsBoundaryRedrawOpen(!isBoundaryRedrawOpen);
          setIsGeoprocessingOpen(false);
          setIsAIAssistantOpen(false);
          setIsOfficeLocatorOpen(false);
        }}
        onOpenPrinter={() => setIsPrinterOpen(true)}
        coordinates={coordinates}
        measurementResult={measurementResult}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
        userLocationActive={userLocationActive}
      />

      {/* Main Multi-Page Body Content */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* LANDING PAGE: Overview Portal */}
        {activePageView === "landing" && (
          <LandingPage
            layers={layers}
            onNavigate={setActivePageView}
            onFocusOffice={handleFocusOffice}
            onLocateUser={handleLocateUser}
            isLocating={isLocating}
            userLocationActive={userLocationActive}
          />
        )}

        {/* PAGE 1: Interactive GIS Map Studio */}
        {activePageView === "map" && (
          <>
            {/* Left Layer TOC Sidebar */}
            <LayerTableOfContents
              layers={layers}
              activeLayerId={activeLayerId}
              selectedBasemap={selectedBasemap}
              onSelectBasemap={setSelectedBasemap}
              onToggleVisibility={handleToggleVisibility}
              onChangeOpacity={handleChangeOpacity}
              onOpenStyleModal={(layer) => setStyleLayer(layer)}
              onOpenAttributeTable={handleOpenAttributeTable}
              onRemoveLayer={handleRemoveLayer}
              onAddLayer={handleAddLayer}
              onSelectActiveLayer={setActiveLayerId}
            />

            {/* Center Map Canvas */}
            <div className="flex-1 relative h-full">
              <MapCanvas
                layers={layers}
                selectedBasemap={selectedBasemap}
                activeTool={activeTool}
                selectedFeatureId={selectedFeatureId}
                onSelectFeature={(featId) => setSelectedFeatureId(featId)}
                onAddUserFeature={handleAddUserFeature}
                onCoordinatesChange={setCoordinates}
                onMeasurementChange={setMeasurementResult}
                onLineDrawnForElevation={handleLineDrawnForElevation}
                centerCoordinates={coordinates}
                onLocateUser={handleLocateUser}
                isLocating={isLocating}
              />
            </div>

            {/* Right Drawers */}
            {isOfficeLocatorOpen && (
              <CompanyOfficeLocator
                layers={layers}
                onFocusOffice={handleFocusOffice}
                onClose={() => setIsOfficeLocatorOpen(false)}
              />
            )}

            {isBoundaryRedrawOpen && (
              <BoundaryRedrawTool
                layers={layers}
                onUpdateBoundaryLayer={handleUpdateBoundaryLayer}
                onClose={() => setIsBoundaryRedrawOpen(false)}
              />
            )}

            {isGeoprocessingOpen && (
              <GeoprocessingToolbar
                layers={layers}
                activeTool={activeTool}
                onSelectTool={setActiveTool}
                onAddLayer={handleAddLayer}
                measurementResult={measurementResult}
                elevationProfileData={elevationProfileData}
                onClose={() => setIsGeoprocessingOpen(false)}
              />
            )}

            {isAIAssistantOpen && (
              <AIGeospatialAnalyst
                layers={layers}
                onAddGeneratedLayer={handleAddLayer}
                onClose={() => setIsAIAssistantOpen(false)}
              />
            )}
          </>
        )}

        {/* PAGE 2: Company Offices & Facility Directory Page */}
        {activePageView === "offices" && (
          <div className="flex-1 flex justify-center bg-slate-950 p-6 overflow-y-auto">
            <div className="w-full max-w-5xl h-full flex flex-col">
              <CompanyOfficeLocator
                layers={layers}
                onFocusOffice={handleFocusOffice}
                onClose={() => setActivePageView("map")}
              />
            </div>
          </div>
        )}

        {/* PAGE 3: Executive Boundary Redraw Portal Page */}
        {activePageView === "redraw" && (
          <div className="flex-1 flex justify-center bg-slate-950 p-6 overflow-y-auto">
            <div className="w-full max-w-4xl h-full flex flex-col">
              <BoundaryRedrawTool
                layers={layers}
                onUpdateBoundaryLayer={handleUpdateBoundaryLayer}
                onClose={() => setActivePageView("map")}
              />
            </div>
          </div>
        )}

        {/* PAGE 4: Spatial Analytics & Intelligence Dashboard Page */}
        {activePageView === "analytics" && (
          <CompanyAnalyticsView
            layers={layers}
            onNavigateToMap={() => setActivePageView("map")}
            onFocusOffice={handleFocusOffice}
          />
        )}

        {/* PAGE 5: Company GIS Datasets Hub & Records Page */}
        {activePageView === "datasets" && (
          <CompanyDatasetsView
            layers={layers}
            onNavigateToMap={() => setActivePageView("map")}
            onOpenAttributeTable={handleOpenAttributeTable}
            onRemoveLayer={handleRemoveLayer}
            onAddLayer={handleAddLayer}
          />
        )}
      </div>

      {/* Bottom Drawer: Attribute Table Inspector */}
      {isAttributeTableOpen && currentAttributeLayer && (
        <AttributeTable
          layer={currentAttributeLayer}
          selectedFeatureId={selectedFeatureId}
          onSelectFeature={(featId) => setSelectedFeatureId(featId)}
          onUpdateFeatureProperties={handleUpdateFeatureProperties}
          onAddField={handleAddField}
          onClose={() => setIsAttributeTableOpen(false)}
        />
      )}

      {/* Symbology / Styling Modal */}
      {styleLayer && (
        <SymbologyModal
          layer={styleLayer}
          onSaveStyle={handleSaveStyle}
          onClose={() => setStyleLayer(null)}
        />
      )}

      {/* Map Composition Print / Export Modal */}
      {isPrinterOpen && (
        <MapLayoutPrinter
          layers={layers}
          selectedBasemap={selectedBasemap}
          onClose={() => setIsPrinterOpen(false)}
        />
      )}
    </div>
  );
}


