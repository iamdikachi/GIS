import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // AI Spatial Analyst API Endpoint
  app.post("/api/gis/ai-analyst", async (req, res) => {
    try {
      const { prompt, layersSummary, mapExtent } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in server environment."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const systemInstruction = `You are an expert GIS Spatial Analyst and Cartographic AI Assistant inside a professional Geographical Information System (GIS) application.
Your goal is to answer geographic and spatial data analysis questions, recommend spatial geoprocessing workflows (buffers, spatial joins, voronoi diagrams, choropleths), or generate valid GeoJSON feature collections when requested.

When asked to generate spatial data or new layers (e.g. "Create 5 hospitals in Victoria Island, Lagos", "Generate zoning polygons for Ikeja", "Create a flood risk zone"), you MUST respond in valid JSON with both an "explanation" string and a "geojson" object containing a valid GeoJSON FeatureCollection with properties and geometry (Point, LineString, Polygon).

If the user asks a general spatial query or analysis question, return "explanation" and leave "geojson" as null.`;

      const userContext = `
User Query: ${prompt}

Current Map Context:
- Extent/Bounding Box: ${JSON.stringify(mapExtent || {})}
- Active Layers: ${JSON.stringify(layersSummary || [])}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userContext,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: "Detailed spatial analysis explanation and recommendations."
              },
              recommendedTools: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of GIS tools recommended (e.g. 'buffer', 'spatial_join', 'choropleth', 'voronoi', 'measure')."
              },
              layerName: {
                type: Type.STRING,
                description: "Suggested layer title if new GeoJSON is generated."
              },
              geojson: {
                type: Type.OBJECT,
                description: "GeoJSON FeatureCollection if generating or modifying spatial features. Set null if no new layer."
              }
            },
            required: ["explanation"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        return res.status(500).json({ error: "Empty response from Gemini AI." });
      }

      const parsed = JSON.parse(resultText);
      return res.json(parsed);

    } catch (err: any) {
      console.error("AI Spatial Analyst Error:", err);
      return res.status(500).json({
        error: err.message || "Failed to process spatial AI request"
      });
    }
  });

  // Serve static assets in production, or mount Vite middleware in development
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GIS Application running on http://localhost:${PORT}`);
  });
}

startServer();
