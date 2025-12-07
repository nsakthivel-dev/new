"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertVectors = upsertVectors;
exports.queryVectors = queryVectors;
exports.clearVectorStore = clearVectorStore;
var fs = require("fs");
var path = require("path");
// Persistent storage file path
var VECTOR_STORE_FILE = path.join(__dirname, '..', '..', 'data', 'vectorstore.json');
// Ensure data directory exists
var dataDir = path.dirname(VECTOR_STORE_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
// Load vector store from disk or initialize empty array
var vectorStore = [];
function loadVectorStore() {
    try {
        if (fs.existsSync(VECTOR_STORE_FILE)) {
            var data = fs.readFileSync(VECTOR_STORE_FILE, 'utf8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('Error loading vector store from disk:', error);
    }
    return [];
}
function saveVectorStore() {
    try {
        fs.writeFileSync(VECTOR_STORE_FILE, JSON.stringify(vectorStore, null, 2));
    }
    catch (error) {
        console.error('Error saving vector store to disk:', error);
    }
}
// Load existing data on startup
vectorStore = loadVectorStore();
function upsertVectors(items) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, _i, items_1, item;
        return __generator(this, function (_a) {
            try {
                _loop_1 = function (item) {
                    var existingIndex = vectorStore.findIndex(function (v) { return v.id === item.id; });
                    if (existingIndex >= 0) {
                        vectorStore[existingIndex] = item;
                    }
                    else {
                        vectorStore.push(item);
                    }
                };
                // For simplicity, we're just replacing items with the same ID
                // In a real implementation, you'd want to properly upsert
                for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                    item = items_1[_i];
                    _loop_1(item);
                }
                // Persist to disk
                saveVectorStore();
                console.log("Upserted ".concat(items.length, " vectors. Total vectors: ").concat(vectorStore.length));
            }
            catch (error) {
                console.error('Error upserting vectors:', error);
                throw new Error("Failed to upsert vectors: ".concat(error instanceof Error ? error.message : String(error)));
            }
            return [2 /*return*/];
        });
    });
}
// Simple cosine similarity calculation
function cosineSimilarity(a, b) {
    // Handle edge cases
    if (!a || !b || a.length === 0 || b.length === 0) {
        return 0;
    }
    if (a.length !== b.length) {
        console.warn('Vectors have different lengths:', a.length, b.length);
        // Use the minimum length to avoid errors
        var minLength = Math.min(a.length, b.length);
        a = a.slice(0, minLength);
        b = b.slice(0, minLength);
    }
    var dotProduct = 0;
    var magnitudeA = 0;
    var magnitudeB = 0;
    for (var i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        magnitudeA += a[i] * a[i];
        magnitudeB += b[i] * b[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
}
function queryVectors(embedding_1) {
    return __awaiter(this, arguments, void 0, function (embedding, topK) {
        var similarities, topMatches;
        if (topK === void 0) { topK = 5; }
        return __generator(this, function (_a) {
            try {
                // Handle case when vector store is empty
                if (vectorStore.length === 0) {
                    return [2 /*return*/, []];
                }
                similarities = vectorStore.map(function (item) { return ({
                    item: item,
                    score: cosineSimilarity(embedding, item.values)
                }); });
                // Sort by score descending and take topK
                similarities.sort(function (a, b) { return b.score - a.score; });
                topMatches = similarities.slice(0, topK);
                // Return the formatted results
                return [2 /*return*/, topMatches.map(function (_a) {
                        var item = _a.item, score = _a.score;
                        return ({
                            id: item.id,
                            score: score,
                            metadata: item.metadata,
                            text: item.text
                        });
                    })];
            }
            catch (error) {
                console.error('Error querying vectors:', error);
                throw new Error("Failed to query vectors: ".concat(error instanceof Error ? error.message : String(error)));
            }
            return [2 /*return*/];
        });
    });
}
// Utility function to clear the vector store (useful for testing)
function clearVectorStore() {
    vectorStore = [];
    saveVectorStore();
}
