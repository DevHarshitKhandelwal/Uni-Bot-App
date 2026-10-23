import mongoose from 'mongoose';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Assignment from '../models/Assignment.js';
import { initialUsers, initialResources, initialAssignments } from '../data/seedData.js';

let isMongoConnected = false;
let dbHost = null;

const sanitizeMongoUri = (uri) => {
  if (!uri) return 'mongodb://127.0.0.1:27017/unibot';
  let cleaned = uri.trim();
  // Fix accidental double slashes after domain (e.g. mongodb.net//unibot)
  cleaned = cleaned.replace(/\.net\/\/+/g, '.net/');
  return cleaned;
};

const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Seeding initial users into MongoDB...');
      for (const u of initialUsers) {
        await User.create({
          fullName: u.fullName,
          email: u.email.toLowerCase(),
          password: u.passwordHash || u.password || '$2a$10$wK1bJ9m1N6GzR9d/PfqZ5eI3m1fKqR5vH1oM3s9q7a5x1e2w3y4z5',
          role: u.role || 'student',
          institution: u.institution,
          department: u.department,
          semester: u.semester || 4,
          studentId: u.studentId || 'CS-2024-042',
          avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        });
      }
    }

    const resourceCount = await Resource.countDocuments();
    if (resourceCount === 0) {
      console.log('[Database] Seeding initial resources into MongoDB...');
      for (const r of initialResources) {
        await Resource.create({
          title: r.title,
          description: r.description,
          subjectCode: r.subjectCode,
          subjectName: r.subjectName,
          semester: r.semester,
          department: r.department,
          category: r.category,
          fileName: r.fileName,
          fileUrl: r.fileUrl,
          fileSize: r.fileSize || 1024000,
          fileType: r.fileType || 'application/pdf',
          contentSnippet: r.contentSnippet || '',
          uploadedBy: r.uploadedBy || 'Academic Faculty / Class Rep',
          upvotes: r.upvotes || [],
          downloadsCount: r.downloadsCount || 42,
          tags: r.tags || [],
          isVerified: r.isVerified !== undefined ? r.isVerified : true,
        });
      }
    }

    const assignmentCount = await Assignment.countDocuments();
    if (assignmentCount === 0) {
      const demoUser = await User.findOne({ email: 'alex@university.edu' });
      if (demoUser && initialAssignments.length > 0) {
        console.log('[Database] Seeding initial assignments into MongoDB...');
        for (const a of initialAssignments) {
          await Assignment.create({
            userId: demoUser.id || demoUser._id,
            title: a.title,
            subjectName: a.subjectName,
            description: a.description,
            dueDate: a.dueDate,
            priority: a.priority || 'medium',
            status: a.status || 'pending',
            files: a.files || [],
            notes: a.notes || '',
          });
        }
      }
    }
    console.log('[Database] MongoDB data verification and auto-seed complete.');
  } catch (seedErr) {
    console.warn('[Database] Seed data check warning:', seedErr.message);
  }
};

export const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;
  const uri = sanitizeMongoUri(rawUri);
  try {
    console.log('[Database] Connecting to MongoDB...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000, // 20s timeout for cloud Atlas connections
      connectTimeoutMS: 20000,
    });
    isMongoConnected = true;
    dbHost = conn.connection.host;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host} (${conn.connection.name})`);
    
    // Seed initial academic dataset into Mongo Atlas if empty
    await seedDatabaseIfEmpty();
  } catch (error) {
    isMongoConnected = false;
    dbHost = null;
    console.warn(`[Database] MongoDB connection note (${error.message}).`);
    console.warn(`[Database] Running with in-memory resilient data store so UniBot works immediately out-of-the-box!`);
  }
};

export const getDBStatus = () => ({
  isMongoConnected,
  host: dbHost,
  type: isMongoConnected ? `MongoDB (${dbHost || 'Cloud Atlas'})` : 'MemoryStore (Zero-config local fallback)'
});
