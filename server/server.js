import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDBStatus } from './config/db.js';
import { getUploadsPath } from './services/storageService.js';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getRagStatus } from './services/chatService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database (with automatic fallback to memory store)
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files & sample study documents
app.use('/uploads', express.static(getUploadsPath()));

// Health & System Info endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = getDBStatus();
  const ragStatus = await getRagStatus();
  res.json({
    status: 'ok',
    app: 'UniBot Academic Platform',
    version: '1.0.0',
    database: dbStatus.type,
    ragReady: ragStatus.ready,
    ragCurrentMode: ragStatus.mode,
    ragMessage: ragStatus.message,
    timestamp: new Date(),
  });
});

// API Routes (MVC Pattern)
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/chat', chatRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎓 UniBot Backend Running on http://localhost:${PORT}`);
  console.log(`📁 Uploads served from: ${getUploadsPath()}`);
  console.log(`🤖 RAG service: ${process.env.RAG_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`=======================================================`);
});
