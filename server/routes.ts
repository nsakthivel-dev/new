import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeCropImage, getChatResponse } from "./openai";
import { insertDiagnosisSchema, insertChatMessageSchema, insertFeedbackSchema } from "@shared/schema";
import { getWeatherData } from "./weather";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import * as pdfParse from "pdf-parse";
import { extractRawText } from "mammoth";

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Extend Express Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Crops endpoints
  app.get("/api/crops", async (_req, res) => {
    try {
      const crops = await storage.getCrops();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crops" });
    }
  });

  app.get("/api/crops/:id", async (req, res) => {
    try {
      const crop = await storage.getCrop(req.params.id);
      if (!crop) {
        return res.status(404).json({ error: "Crop not found" });
      }
      res.json(crop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crop" });
    }
  });

  // Diagnoses endpoints
  app.get("/api/diagnoses", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const diagnoses = await storage.getDiagnoses(userId);
      res.json(diagnoses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diagnoses" });
    }
  });

  app.post("/api/diagnoses", async (req, res) => {
    try {
      const validatedData = insertDiagnosisSchema.parse(req.body);
      
      // Extract values with proper type checking
      const cropId = typeof validatedData.cropId === 'string' ? validatedData.cropId : undefined;
      const imageUrl = typeof validatedData.imageUrl === 'string' ? validatedData.imageUrl : undefined;
      
      if (imageUrl && cropId) {
        const crop = await storage.getCrop(cropId);
        if (!crop) {
          return res.status(400).json({ error: "Invalid crop ID" });
        }

        // Ensure imageUrl is a string before splitting
        const imageUrlString = imageUrl as string;
        const base64Image = imageUrlString.split(",")[1] || imageUrlString;
        const symptoms = Array.isArray(validatedData.symptoms) ? validatedData.symptoms as string[] : [];
      
        let aiResults;
        if (!process.env.OPENAI_API_KEY) {
          aiResults = {
            diseases: [
              { name: "AI Analysis Unavailable", confidence: 0, riskLevel: "medium" }
            ],
            analysis: "AI image analysis is currently unavailable. Please configure OPENAI_API_KEY to enable this feature.",
            recommendations: "Please consult with local agricultural experts for crop diagnosis. Visit the Experts page to find verified agricultural extension officers in your area."
          };
        } else {
          aiResults = await analyzeCropImage(base64Image, crop.name, symptoms);
        }
      
        // Create diagnosis data with proper types
        const diagnosisData: any = {
          userId: typeof validatedData.userId === 'string' ? validatedData.userId : undefined,
          cropId: cropId,
          imageUrl: imageUrl,
          symptoms: symptoms,
          results: aiResults.diseases,
          aiAnalysis: aiResults.analysis,
          recommendations: aiResults.recommendations,
        };

        const diagnosis = await storage.createDiagnosis(diagnosisData);
        res.json(diagnosis);
      } else {
        // Create diagnosis data with proper types
        const diagnosisData: any = {
          userId: typeof validatedData.userId === 'string' ? validatedData.userId : undefined,
          cropId: cropId,
          imageUrl: imageUrl,
          symptoms: Array.isArray(validatedData.symptoms) ? validatedData.symptoms as string[] : undefined,
          results: validatedData.results,
          aiAnalysis: typeof validatedData.aiAnalysis === 'string' ? validatedData.aiAnalysis : undefined,
          recommendations: typeof validatedData.recommendations === 'string' ? validatedData.recommendations : undefined,
        };
      
        const diagnosis = await storage.createDiagnosis(diagnosisData);
        res.json(diagnosis);
      }
    } catch (error: any) {
      console.error("Diagnosis error:", error);
      res.status(400).json({ error: error.message || "Failed to create diagnosis" });
    }
  });

  // Diseases endpoints
  app.get("/api/diseases", async (req, res) => {
    try {
      const cropId = req.query.cropId as string | undefined;
      const diseases = cropId 
        ? await storage.getDiseasesByCrop(cropId)
        : await storage.getDiseases();
      res.json(diseases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diseases" });
    }
  });

  // Experts endpoints
  app.get("/api/experts", async (req, res) => {
    try {
      // Properly handle query parameters
      const district = typeof req.query.district === 'string' ? req.query.district : undefined;
      const specialization = typeof req.query.specialization === 'string' ? req.query.specialization : undefined;
      const languages = typeof req.query.languages === 'string' ? req.query.languages : undefined;
      
      // For Tamil Nadu focus, we can add default filtering or special handling here if needed
      if (district || specialization || languages) {
        const filters = {
          district: district,
          specialization: specialization,
          languages: languages,
        };
        const experts = await storage.getExpertsByFilters(filters);
        res.json(experts);
      } else {
        const experts = await storage.getExperts();
        res.json(experts);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experts" });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const alerts = activeOnly 
        ? await storage.getActiveAlerts()
        : await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Chat endpoints
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Extract values with proper type checking
      const userId = typeof validatedData.userId === 'string' ? validatedData.userId : "guest";
      const role = typeof validatedData.role === 'string' ? validatedData.role : "user";
      const content = typeof validatedData.content === 'string' ? validatedData.content : "";
      
      const userMessage = await storage.createChatMessage({
        userId: userId,
        role: role,
        content: content,
        imageUrl: typeof validatedData.imageUrl === 'string' ? validatedData.imageUrl : undefined,
        metadata: validatedData.metadata,
      } as any);
      
      // Properly check role value
      if (role === "user") {
        const chatHistory = await storage.getChatMessages(userId);
        const messages = chatHistory.map(msg => ({
          role: typeof msg.role === 'string' ? msg.role : 'user',
          content: typeof msg.content === 'string' ? msg.content : '',
        }));

        let aiResponse: string;
        if (!process.env.OPENAI_API_KEY) {
          aiResponse = "AI chat is currently unavailable. Please configure OPENAI_API_KEY to enable this feature. In the meantime, please visit the Experts page to connect with agricultural specialists who can help with your farming questions.";
        } else {
          aiResponse = await getChatResponse(messages, validatedData.metadata);
        }
      
        const assistantMessage = await storage.createChatMessage({
          userId: userId,
          role: "assistant",
          content: aiResponse,
          metadata: validatedData.metadata,
          imageUrl: undefined,
        } as any);

        res.json({
          userMessage,
          assistantMessage,
        });
      } else {
        res.json(userMessage);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(400).json({ error: error.message || "Failed to send message" });
    }
  });

  // Feedback endpoints
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(validatedData);
      res.json(feedback);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to submit feedback" });
    }
  });

  // Weather endpoint
  app.get("/api/weather", async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location || typeof location !== 'string') {
        return res.status(400).json({ error: "Location parameter is required" });
      }
      
      const weatherData = await getWeatherData(location);
      res.json(weatherData);
    } catch (error: any) {
      console.error("Weather error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch weather data" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      const multerReq = req as MulterRequest;
      
      if (!multerReq.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = multerReq.file.path;
      const fileName = multerReq.file.originalname;
      let content = "";

      // Determine file type and extract content
      if (multerReq.file.mimetype === "application/pdf" || fileName.endsWith(".pdf")) {
        // PDF file
        const data = await fs.readFile(filePath);
        const pdfData = await (pdfParse as any)(data);
        content = pdfData.text;
      } else if (
        multerReq.file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        // DOCX file
        const result = await extractRawText({ path: filePath });
        content = result.value;
      } else if (
        multerReq.file.mimetype === "text/plain" ||
        fileName.endsWith(".txt")
      ) {
        // TXT file
        content = await fs.readFile(filePath, "utf-8");
      } else {
        // Unsupported file type
        await fs.unlink(filePath); // Clean up uploaded file
        return res
          .status(400)
          .json({ error: "Unsupported file type. Please upload PDF, DOCX, or TXT files." });
      }

      // Clean up uploaded file
      await fs.unlink(filePath);

      // Respond with extracted content
      res.json({
        content: content,
        filename: fileName,
      });
    } catch (error: any) {
      console.error("File upload error:", error);
      res.status(500).json({ error: error.message || "Failed to process file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}