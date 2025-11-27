import {
  type User, type InsertUser,
  type Crop, type InsertCrop,
  type Disease, type InsertDisease,
  type Diagnosis, type InsertDiagnosis,
  type Expert, type InsertExpert,
  type Alert, type InsertAlert,
  type ChatMessage, type InsertChatMessage,
  type Feedback, type InsertFeedback,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Define Content type
interface Content {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Crops
  getCrops(): Promise<Crop[]>;
  getCropsByCategory(category: string): Promise<Crop[]>;
  getCrop(id: string): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  
  // Diseases
  getDiseases(): Promise<Disease[]>;
  getDiseasesByCrop(cropId: string): Promise<Disease[]>;
  getDisease(id: string): Promise<Disease | undefined>;
  createDisease(disease: InsertDisease): Promise<Disease>;
  
  // Diagnoses
  getDiagnoses(userId?: string): Promise<Diagnosis[]>;
  getDiagnosis(id: string): Promise<Diagnosis | undefined>;
  createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis>;
  
  // Experts
  getExperts(): Promise<Expert[]>;
  getExpertsByFilters(filters: { district?: string; specialization?: string; languages?: string }): Promise<Expert[]>;
  createExpert(expert: InsertExpert): Promise<Expert>;
  
  // Alerts
  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  
  // Chat Messages
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Feedback
  getFeedback(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Content
  getContent(): Promise<Content[]>;
  getContentById(id: string): Promise<Content | undefined>;
  createContent(content: Omit<Content, "id">): Promise<Content>;
  deleteContent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private crops: Map<string, Crop>;
  private diseases: Map<string, Disease>;
  private diagnoses: Map<string, Diagnosis>;
  private experts: Map<string, Expert>;
  private alerts: Map<string, Alert>;
  private chatMessages: Map<string, ChatMessage>;
  private feedbackList: Map<string, Feedback>;
  private content: Map<string, Content>;

  constructor() {
    this.users = new Map();
    this.crops = new Map();
    this.diseases = new Map();
    this.diagnoses = new Map();
    this.experts = new Map();
    this.alerts = new Map();
    this.chatMessages = new Map();
    this.feedbackList = new Map();
    this.content = new Map();
    
    this.seedInitialData();
  }

  private seedInitialData() {
    const cropData = [
      { name: "Tomato", scientificName: "Solanum lycopersicum", category: "vegetables", imageUrl: "/crops/tomato.jpg", description: "Popular vegetable crop" },
      { name: "Maize", scientificName: "Zea mays", category: "cereals", imageUrl: "/crops/maize.jpg", description: "Staple cereal crop" },
      { name: "Rice", scientificName: "Oryza sativa", category: "cereals", imageUrl: "/crops/rice.jpg", description: "Primary food crop" },
      { name: "Wheat", scientificName: "Triticum aestivum", category: "cereals", imageUrl: "/crops/wheat.jpg", description: "Essential grain crop" },
      { name: "Potato", scientificName: "Solanum tuberosum", category: "vegetables", imageUrl: "/crops/potato.jpg", description: "Tuberous crop" },
      { name: "Banana", scientificName: "Musa", category: "fruits", imageUrl: "/crops/banana.jpg", description: "Tropical fruit" },
    ];

    cropData.forEach(crop => {
      const id = randomUUID();
      this.crops.set(id, { 
        id,
        name: crop.name,
        scientificName: crop.scientificName ?? null,
        category: crop.category,
        imageUrl: crop.imageUrl ?? null,
        description: crop.description ?? null,
      } as any);
    });

    // Updated expert data focusing on India and Tamil Nadu
    const expertData = [
      { name: "Dr. Ramesh Kumar", specialization: ["vegetables", "pest_management"], district: "Coimbatore", languages: ["English", "Tamil"], contactEmail: "ramesh@tnagri.tn.gov.in", avatarUrl: "", verified: true },
      { name: "Dr. Priya Lakshmi", specialization: ["cereals", "disease_control"], district: "Thanjavur", languages: ["English", "Tamil"], contactEmail: "priya@tnagri.tn.gov.in", avatarUrl: "", verified: true },
      { name: "Dr. Senthil Nathan", specialization: ["fruits", "organic_farming"], district: "Madurai", languages: ["English", "Tamil"], contactEmail: "senthil@tnagri.tn.gov.in", avatarUrl: "", verified: true },
      { name: "Dr. Karthik Raj", specialization: ["cash_crops", "soil_health"], district: "Erode", languages: ["English", "Tamil"], contactEmail: "karthik@tnagri.tn.gov.in", avatarUrl: "", verified: true },
      { name: "Dr. Meena Devi", specialization: ["vegetables", "water_management"], district: "Salem", languages: ["English", "Tamil"], contactEmail: "meena@tnagri.tn.gov.in", avatarUrl: "", verified: true },
      { name: "Dr. Arjun Reddy", specialization: ["cereals", "climate_resilience"], district: "Chennai", languages: ["English", "Tamil", "Telugu"], contactEmail: "arjun@tnagri.tn.gov.in", avatarUrl: "", verified: true },
    ];

    expertData.forEach(expert => {
      const id = randomUUID();
      this.experts.set(id, { 
        id,
        name: expert.name,
        specialization: expert.specialization ?? null,
        district: expert.district ?? null,
        languages: expert.languages ?? null,
        contactEmail: expert.contactEmail ?? null,
        contactPhone: null,
        avatarUrl: expert.avatarUrl ?? null,
        verified: expert.verified ?? null,
      } as any);
    });

    const alertData = [
      { title: "Fall Armyworm Alert", description: "Increased sightings in maize fields across Tamil Nadu", type: "pest_outbreak", severity: "urgent", region: "Tamil Nadu", cropIds: [] },
      { title: "Late Blight Warning", description: "Weather conditions favorable for potato late blight in hill areas", type: "weather", severity: "warning", region: "Tamil Nadu", cropIds: [] },
      { title: "New Subsidy Scheme", description: "Government announces new crop insurance program for small farmers", type: "scheme", severity: "info", region: "Tamil Nadu", cropIds: [] },
    ];

    alertData.forEach(alert => {
      const id = randomUUID();
      this.alerts.set(id, { 
        id,
        type: alert.type,
        description: alert.description,
        severity: alert.severity || null,
        title: alert.title,
        region: alert.region || null,
        cropIds: alert.cropIds || null,
        publishedAt: new Date(),
        expiresAt: null,
      } as any);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: any = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      language: insertUser.language ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Crops
  async getCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values());
  }

  async getCropsByCategory(category: string): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(crop => crop.category === category);
  }

  async getCrop(id: string): Promise<Crop | undefined> {
    return this.crops.get(id);
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const id = randomUUID();
    const crop: any = { 
      id,
      name: insertCrop.name,
      scientificName: insertCrop.scientificName ?? null,
      category: insertCrop.category,
      imageUrl: insertCrop.imageUrl ?? null,
      description: insertCrop.description ?? null,
    };
    this.crops.set(id, crop);
    return crop;
  }

  // Diseases
  async getDiseases(): Promise<Disease[]> {
    return Array.from(this.diseases.values());
  }

  async getDiseasesByCrop(cropId: string): Promise<Disease[]> {
    return Array.from(this.diseases.values()).filter(disease => disease.cropId === cropId);
  }

  async getDisease(id: string): Promise<Disease | undefined> {
    return this.diseases.get(id);
  }

  async createDisease(insertDisease: InsertDisease): Promise<Disease> {
    const id = randomUUID();
    const disease = { 
      id,
      name: (insertDisease.name as any)?.[0] ?? insertDisease.name,
      cropId: (insertDisease.cropId as any)?.[0] ?? insertDisease.cropId ?? null,
      symptoms: (insertDisease.symptoms as any)?.[0] ?? insertDisease.symptoms ?? null,
      causes: (insertDisease.causes as any)?.[0] ?? insertDisease.causes ?? null,
      organicTreatment: (insertDisease.organicTreatment as any)?.[0] ?? insertDisease.organicTreatment ?? null,
      chemicalTreatment: (insertDisease.chemicalTreatment as any)?.[0] ?? insertDisease.chemicalTreatment ?? null,
      prevention: (insertDisease.prevention as any)?.[0] ?? insertDisease.prevention ?? null,
      imageUrls: (insertDisease.imageUrls as any)?.[0] ?? insertDisease.imageUrls ?? null,
      severity: (insertDisease.severity as any)?.[0] ?? insertDisease.severity ?? null,
    } as Disease;
    this.diseases.set(id, disease);
    return disease;
  }

  // Diagnoses
  async getDiagnoses(userId?: string): Promise<Diagnosis[]> {
    const all = Array.from(this.diagnoses.values());
    if (userId) {
      return all.filter(d => d.userId === userId);
    }
    return all;
  }

  async getDiagnosis(id: string): Promise<Diagnosis | undefined> {
    return this.diagnoses.get(id);
  }

  async createDiagnosis(insertDiagnosis: InsertDiagnosis): Promise<Diagnosis> {
    const id = randomUUID();
    const diagnosis = { 
      id,
      imageUrl: (insertDiagnosis.imageUrl as any)?.[0] ?? insertDiagnosis.imageUrl ?? null,
      cropId: (insertDiagnosis.cropId as any)?.[0] ?? insertDiagnosis.cropId ?? null,
      symptoms: (insertDiagnosis.symptoms as any)?.[0] ?? insertDiagnosis.symptoms ?? null,
      userId: (insertDiagnosis.userId as any)?.[0] ?? insertDiagnosis.userId ?? null,
      results: insertDiagnosis.results ?? null,
      aiAnalysis: (insertDiagnosis.aiAnalysis as any)?.[0] ?? insertDiagnosis.aiAnalysis ?? null,
      recommendations: (insertDiagnosis.recommendations as any)?.[0] ?? insertDiagnosis.recommendations ?? null,
      createdAt: new Date(),
    } as Diagnosis;
    this.diagnoses.set(id, diagnosis);
    return diagnosis;
  }

  // Experts
  async getExperts(): Promise<Expert[]> {
    return Array.from(this.experts.values());
  }

  async getExpertsByFilters(filters: { district?: string; specialization?: string; languages?: string }): Promise<Expert[]> {
    return Array.from(this.experts.values()).filter(expert => {
      if (filters.district && expert.district !== filters.district) return false;
      if (filters.specialization && !expert.specialization?.includes(filters.specialization)) return false;
      if (filters.languages && !expert.languages?.includes(filters.languages)) return false;
      return true;
    });
  }

  async createExpert(insertExpert: InsertExpert): Promise<Expert> {
    const id = randomUUID();
    const expert = { 
      id,
      name: (insertExpert.name as any)?.[0] ?? insertExpert.name,
      specialization: (insertExpert.specialization as any)?.[0] ?? insertExpert.specialization ?? null,
      district: (insertExpert.district as any)?.[0] ?? insertExpert.district ?? null,
      languages: (insertExpert.languages as any)?.[0] ?? insertExpert.languages ?? null,
      contactEmail: (insertExpert.contactEmail as any)?.[0] ?? insertExpert.contactEmail ?? null,
      contactPhone: (insertExpert.contactPhone as any)?.[0] ?? insertExpert.contactPhone ?? null,
      avatarUrl: (insertExpert.avatarUrl as any)?.[0] ?? insertExpert.avatarUrl ?? null,
      verified: (insertExpert.verified as any)?.[0] ?? insertExpert.verified ?? null,
    } as Expert;
    this.experts.set(id, expert);
    return expert;
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => {
      const dateA = a.publishedAt?.getTime() || 0;
      const dateB = b.publishedAt?.getTime() || 0;
      return dateB - dateA;
    });
  }

  async getActiveAlerts(): Promise<Alert[]> {
    const now = new Date();
    return Array.from(this.alerts.values()).filter(alert => {
      if (!alert.expiresAt) return true;
      return alert.expiresAt > now;
    }).sort((a, b) => {
      const dateA = a.publishedAt?.getTime() || 0;
      const dateB = b.publishedAt?.getTime() || 0;
      return dateB - dateA;
    });
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert = { 
      id,
      type: (insertAlert.type as any)?.[0] ?? insertAlert.type,
      description: (insertAlert.description as any)?.[0] ?? insertAlert.description,
      severity: (insertAlert.severity as any)?.[0] ?? insertAlert.severity ?? null,
      title: (insertAlert.title as any)?.[0] ?? insertAlert.title,
      region: (insertAlert.region as any)?.[0] ?? insertAlert.region ?? null,
      cropIds: (insertAlert.cropIds as any)?.[0] ?? insertAlert.cropIds ?? null,
      publishedAt: new Date(),
      expiresAt: insertAlert.expiresAt ?? null,
    } as Alert;
    this.alerts.set(id, alert);
    return alert;
  }

  // Chat Messages
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateA - dateB;
      });
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message = { 
      id,
      userId: (insertMessage.userId as any)?.[0] ?? insertMessage.userId ?? null,
      role: (insertMessage.role as any)?.[0] ?? insertMessage.role,
      content: (insertMessage.content as any)?.[0] ?? insertMessage.content,
      imageUrl: (insertMessage.imageUrl as any)?.[0] ?? insertMessage.imageUrl ?? null,
      metadata: insertMessage.metadata ?? null,
      createdAt: new Date(),
    } as ChatMessage;
    this.chatMessages.set(id, message);
    return message;
  }

  // Feedback
  async getFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedbackList.values()).sort((a, b) => {
      const dateA = a.createdAt?.getTime() || 0;
      const dateB = b.createdAt?.getTime() || 0;
      return dateB - dateA;
    });
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedbackItem = { 
      id,
      name: (insertFeedback.name as any)?.[0] ?? insertFeedback.name ?? null,
      email: (insertFeedback.email as any)?.[0] ?? insertFeedback.email ?? null,
      type: (insertFeedback.type as any)?.[0] ?? insertFeedback.type,
      message: (insertFeedback.message as any)?.[0] ?? insertFeedback.message,
      status: "pending",
      createdAt: new Date(),
    } as Feedback;
    this.feedbackList.set(id, feedbackItem);
    return feedbackItem;
  }

  // Content
  async getContent(): Promise<Content[]> {
    return Array.from(this.content.values());
  }

  async getContentById(id: string): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async createContent(newContent: Omit<Content, "id">): Promise<Content> {
    const id = randomUUID();
    const content = {
      id,
      ...newContent
    };
    this.content.set(id, content);
    return content;
  }

  async deleteContent(id: string): Promise<boolean> {
    return this.content.delete(id);
  }
}

export const storage = new MemStorage();