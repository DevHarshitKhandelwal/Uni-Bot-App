# Product Requirement Document (PRD)
## Project Name: UniBot
**Document Version:** 1.0.0  
**Status:** Approved / Draft for Implementation  
**Tech Stack:** MERN (MongoDB, Express.js, React, Node.js) with MVC Architecture  
**Target Delivery:** Phased Implementation (MVP to Production)

---

## 1. Executive Summary & Vision

### 1.1 Problem Statement
College and university students face constant fragmentation of learning materials:
- **Scattered Resources:** Syllabi, lecture notes, previous year question papers (PYQs), and lab manuals are distributed randomly across Google Drives, WhatsApp groups, Discord servers, and LMS portals.
- **Assignment Confusion:** Deadlines, prompt documents, reference readings, and student submissions get buried in chat threads.
- **Ineffective Generic AI:** Standard AI chatbots (like ChatGPT) lack contextual awareness of a student's specific university syllabus, professor notes, or personal uploaded PDFs, leading to generic or inaccurate answers.

### 1.2 Proposed Solution: UniBot
**UniBot** is an all-in-one student resource platform and contextual AI companion designed with a warm, authentic, "human-crafted" aesthetic. It integrates:
1. **Centralized Academic Hub:** A structured repository for course notes, PYQs, assignments, and study materials.
2. **Authenticated Student Vault:** Secure personal storage to upload, organize, preview, and download assignments and reference files.
3. **Contextual RAG Chatbot ("Ask My Data"):** A Retrieval-Augmented Generation assistant powered by vector search over student-uploaded documents and university-curated knowledge bases. Students get exact answers with citations to the uploaded note and page number.
4. **Human-Centric UX:** Designed specifically to reject "generic AI template" clichés (no hyper-saturated neon gradients or sterile corporate dashboards), prioritizing tactile readability, clear navigation, and focus.

---

## 2. Target Audience & User Personas

| Persona | Role / Profile | Primary Goal | Pain Point Solved |
|---|---|---|---|
| **Aarav (Undergraduate Student)** | 2nd-year B.Tech / CS student taking 6 heavy courses | Needs quick answers from professor slides during exam prep | Doesn't have time to read 150-slide decks; asks UniBot to explain specific formulas based on lecture slides |
| **Priya (Class Representative / Contributor)** | 3rd-year student managing class drive links | Wants to upload verified PYQs and notes for the cohort | Replaces cluttered Google Drive folders with structured, tagged subject directories |
| **Rohan (Assignment Submitter)** | Final-year student tracking lab submissions | Uploads assignment drafts, verifies guidelines, downloads submission-ready files | Avoids missing assignment rubrics and keeps personal drafts organized |

---

## 3. Core Functional Requirements

### 3.1 Authentication & Profile Management
- **User Registration & Login:** Email/Password authentication and optional College SSO / Google OAuth.
- **Session Management:** Secure JWT stored in HttpOnly cookies, refresh token rotation.
- **Student Profile:**
  - Full Name, Student ID / Roll Number, Institution / University.
  - Department / Branch (e.g., Computer Science, Mechanical).
  - Academic Year & Semester.
- **Access Control:**
  - Role-based permissions (`student`, `class_rep`, `admin`).
  - Public resources viewable with rate-limited downloads; personal vault and RAG Q&A require authentication.

### 3.2 Academic Resource Hub
- **Hierarchical Classification:**
  - Institution $\rightarrow$ Department $\rightarrow$ Semester $\rightarrow$ Course/Subject $\rightarrow$ Module/Unit.
- **Resource Categorization:**
  - Lecture Notes & Slides (`.pdf`, `.pptx`).
  - Previous Year Questions (PYQs) with answer keys.
  - Lab Manuals & Code Snippets.
  - Reference Books & Recommended Reading lists.
- **Discovery & Search:**
  - Instant full-text search with debounce (searching titles, tags, and course codes).
  - Faceted filters (by Subject, Semester, Material Type, Rating, Upload Date).
  - Upvote & Quality Rating system to surface the most helpful notes.

### 3.3 Assignment & File Management (Vault)
- **File Upload Engine:**
  - Support for multi-file upload (`.pdf`, `.docx`, `.txt`, `.pptx`, `.png`, `.jpg`).
  - Drag-and-drop file uploader with client-side mime validation and size limit enforcement (e.g., max 25MB per file for standard students).
  - Progress bar and upload status indicator.
- **File Storage:**
  - Cloud storage integration (AWS S3 / Cloudinary / Supabase Storage) with presigned secure URLs.
- **File Vault Operations:**
  - In-browser file preview for PDFs and common images.
  - One-click secure download with original filename preservation.
  - Metadata tagging: Subject, Deadline Date, Submission Status (`Not Started`, `Drafting`, `Submitted`), Tags.
  - Bulk actions: Multi-select download, delete, move to folder.

### 3.4 Contextual RAG Chatbot ("Ask My Data")
- **Dual Query Scope:**
  1. *Global Course Mode:* Queries all peer-verified notes and syllabus materials for the selected course.
  2. *Personal Vault Mode:* Queries strictly the user’s personal uploaded documents and assignments.
- **Document Ingestion & Processing Pipeline:**
  - Text extraction from uploaded PDFs and Word documents.
  - Semantic chunking (chunk size: 600-800 tokens, 100-token overlap).
  - Embedding generation using OpenAI `text-embedding-3-small` or HuggingFace embeddings.
  - Vector storage in MongoDB Atlas Vector Search (native MERN stack) or Pinecone/Chroma.
- **Conversational RAG Execution:**
  - Query vectorization & top-K similarity search (Cosine similarity, $k=4\text{–}6$).
  - Prompt construction with retrieved context, system instructions, and chat history buffer.
  - Streaming generation via Server-Sent Events (SSE) for low Time-to-First-Token (TTFT).
  - **Inline Citations:** Responses cite specific document names and page numbers (e.g., `[Operating_Systems_Unit2.pdf, Page 14]`).
  - **Click-to-Highlight:** Clicking a citation opens the PDF viewer directly at that referenced page.

---

## 4. UI/UX Philosophy: "Human-Crafted, Not AI-Made"

### 4.1 Anti-Patterns to Avoid ("AI Look")
- ❌ **No saturated purple-cyan glow:** Avoid generic neon meshes, neon badges, and generic cybernetic gradients.
- ❌ **No heavy glassmorphism blur traps:** Avoid unreadable low-contrast blurred cards with thin white fonts.
- ❌ **No sterile corporate SaaS templates:** Avoid cold gray-scale monoculture and empty decorative cards with no real utility.
- ❌ **No canned robot/sparkle clipart:** Avoid generic "magic wand" and "floating 3D robot head" imagery.

### 4.2 Core Design Principles ("Human & Editorial")
- **Tactile Paper & Warm Neutrals:**
  - Background: Warm cream/off-white (`#FBFBF9` in light mode), deep slate/charcoal ink (`#1A1A1E` in dark mode).
  - Card surfaces: Crisp border outlines (`1px solid #E5E5DF`), subtle physical card elevation (`box-shadow: 0 1px 3px rgba(0,0,0,0.05)`).
- **Typography with Editorial Character:**
  - Primary UI Font: **Plus Jakarta Sans** or **Inter** (clean legibility at 12–14px).
  - Headings & Academic Accents: **Fraunces** or **Newsreader** (warm serif tone that feels like an academic library, not a generic robot).
  - Monospace: **JetBrains Mono** for course codes, dates, and token counts.
- **Intentional Color Accents for Subjects:**
  - Muted sage green (`#2D6A4F`) for Completed / Verified.
  - Terracotta / Warm amber (`#D97706` / `#C85A32`) for Deadlines / Urgent.
  - Classic Oxford Blue (`#1E3A8A`) for Core Academic actions.
- **Student-First Usability & Ergonomics:**
  - Persistent Breadcrumb navigation: `CS > Semester 4 > Database Systems > Assignment 2`.
  - Global Command Palette (`Cmd + K` / `Ctrl + K`) to jump straight to any subject, assignment, or start a chat.
  - Sticky side-by-side view: Split screen with PDF reader on the left and RAG Chat on the right for zero context-switching during study sessions.

---

## 5. Technical Architecture & MVC Implementation

### 5.1 Architecture Overview
```
+--------------------------------------------------------------+
|                    Client Tier (React SPA)                   |
|   Tailored UI Components | State (Zustand/Context) | Router  |
+------------------------------+-------------------------------+
                               | REST APIs / SSE Streaming
+------------------------------v-------------------------------+
|                 Application Tier (Node.js & Express)         |
|   +------------------------------------------------------+   |
|   |                  MVC Architecture                    |   |
|   |  Routes        ->  Middleware  ->  Controllers       |   |
|   |  Controllers   ->  Services    ->  Models            |   |
|   +------------------------------------------------------+   |
+-----------------+----------------------------+---------------+
                  |                            |
+-----------------v----------+     +-----------v---------------+
|    MongoDB Database        |     |     RAG / AI Engine       |
|  - Users, Resources, Files |     |  - Document Parser        |
|  - Atlas Vector Search     |     |  - Embedder + LangChain   |
|  - Chat History & Metadata |     |  - LLM (OpenAI / Claude)  |
+----------------------------+     +---------------------------+
```

### 5.2 Detailed Directory Structure (Clean MVC)

```
unibot/
├── client/                               # Frontend (React + Vite)
│   ├── public/                           # Static assets, favicon, icons
│   └── src/
│       ├── assets/                       # Custom illustrations, logos
│       ├── components/                   # Reusable UI building blocks
│       │   ├── common/                   # Button, Input, Modal, Badge, Dropdown
│       │   ├── layout/                   # Navbar, Sidebar, Breadcrumb, Footer
│       │   ├── resources/                # ResourceCard, FilterBar, UploadModal
│       │   ├── assignments/              # AssignmentList, DueDateBadge, FileRow
│       │   ├── chat/                     # ChatWindow, MessageBubble, CitationTag
│       │   └── pdf/                      # SplitPdfViewer, HighlightOverlay
│       ├── context/                      # AuthContext, ThemeContext
│       ├── hooks/                        # useAuth, useRAGChat, useFileUpload
│       ├── pages/                        # View controllers / Routed pages
│       │   ├── HomePage.jsx              # Landing & overview
│       │   ├── AuthPage.jsx              # Login / Register
│       │   ├── ResourceHubPage.jsx       # Academic repository
│       │   ├── VaultPage.jsx             # Personal files & assignments
│       │   ├── StudyBotPage.jsx          # Dedicated RAG chat interface
│       │   └── ProfilePage.jsx           # Account & preferences
│       ├── services/                     # API client services (Axios / Fetch)
│       │   ├── api.js                    # Base Axios instance with interceptors
│       │   ├── authService.js
│       │   ├── resourceService.js
│       │   └── chatService.js
│       ├── styles/                       # CSS design tokens & utilities
│       │   ├── design-tokens.css         # CSS variables (colors, fonts, radii)
│       │   └── index.css                 # Global styling
│       ├── utils/                        # Formatters, date helpers, file icons
│       ├── App.jsx                       # Routing & provider hierarchy
│       └── main.jsx                      # Entrypoint
│
└── server/                               # Backend (Node.js + Express MVC)
    ├── config/
    │   ├── db.js                         # MongoDB connection
    │   ├── s3.js                         # Cloud object storage configuration
    │   └── vectorDb.js                   # MongoDB Vector Search or Pinecone config
    ├── controllers/                      # Request handling & orchestration
    │   ├── authController.js             # Register, login, refresh, logout
    │   ├── userController.js             # Profile update, preferences
    │   ├── resourceController.js         # Public subject notes CRUD, search
    │   ├── assignmentController.js       # Student assignment upload, download, delete
    │   └── chatController.js             # RAG conversational query & streaming
    ├── middleware/
    │   ├── authMiddleware.js             # JWT verification & role validation
    │   ├── uploadMiddleware.js           # Multer file handling & memory buffers
    │   ├── rateLimiter.js                # Express rate limit for AI queries
    │   └── errorHandler.js               # Centralized exception handler
    ├── models/                           # MongoDB Mongoose schemas
    │   ├── User.js                       # User account & credentials
    │   ├── Subject.js                    # Course / Subject hierarchy
    │   ├── Resource.js                   # Public academic notes & PYQs
    │   ├── Assignment.js                 # Personal student files & deadlines
    │   ├── DocumentChunk.js              # Vector embeddings & text snippets
    │   └── ChatSession.js                # Conversation history & messages
    ├── routes/                           # Route definitions
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── resourceRoutes.js
    │   ├── assignmentRoutes.js
    │   └── chatRoutes.js
    ├── services/                         # Reusable business logic
    │   ├── authService.js                # Password hashing, token issue
    │   ├── storageService.js             # S3 presigned URL generation & upload
    │   ├── ragService.js                 # Chunking, embedding, vector query, LLM
    │   └── documentParser.js             # PDF & DOCX text extraction
    ├── utils/
    │   ├── logger.js                     # Winston / Morgan logging
    │   └── apiResponse.js                # Standardized JSON response envelope
    ├── .env.example                      # Documented environment variables
    ├── server.js                         # Express app initialization
    └── package.json
```

---

## 6. Database Schema Design (MongoDB / Mongoose)

### 6.1 `User` Schema
```javascript
{
  _id: ObjectId,
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'class_rep', 'admin'], default: 'student' },
  institution: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}
```

### 6.2 `Resource` Schema (Public Academic Materials)
```javascript
{
  _id: ObjectId,
  title: { type: String, required: true, index: 'text' },
  description: { type: String },
  subjectCode: { type: String, required: true, index: true },
  subjectName: { type: String, required: true },
  semester: { type: Number, required: true, index: true },
  category: { 
    type: String, 
    enum: ['lecture_note', 'pyq', 'lab_manual', 'syllabus', 'cheatsheet'], 
    required: true,
    index: true 
  },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number }, // in bytes
  fileType: { type: String }, // e.g., 'application/pdf'
  uploadedBy: { type: ObjectId, ref: 'User', required: true },
  upvotes: [{ type: ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  tags: [{ type: String, index: true }],
  createdAt: { type: Date, default: Date.now }
}
```

### 6.3 `Assignment` Schema (Personal Vault & Tasks)
```javascript
{
  _id: ObjectId,
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  subjectName: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'], 
    default: 'pending',
    index: true 
  },
  files: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: { type: String },
  isIndexedForRAG: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

### 6.4 `DocumentChunk` Schema (Vector Search Store)
```javascript
{
  _id: ObjectId,
  sourceId: { type: ObjectId, required: true, index: true }, // ref to Resource or Assignment
  sourceType: { type: String, enum: ['Resource', 'Assignment'], required: true },
  userId: { type: ObjectId, ref: 'User', index: true }, // null for public resources
  documentTitle: { type: String, required: true },
  pageNumber: { type: Number },
  chunkIndex: { type: Number, required: true },
  content: { type: String, required: true },
  embedding: { 
    type: [Number], 
    required: true 
    // Indexed via MongoDB Atlas Vector Index:
    // { "type": "vectorSearch", "fields": [{ "path": "embedding", "numDimensions": 1536, "similarity": "cosine" }] }
  },
  createdAt: { type: Date, default: Date.now }
}
```

### 6.5 `ChatSession` & Message Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New Conversation' },
  scope: { type: String, enum: ['global_course', 'personal_vault'], default: 'personal_vault' },
  filterSubject: { type: String },
  messages: [{
    sender: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    citations: [{
      documentTitle: { type: String },
      pageNumber: { type: Number },
      snippet: { type: String },
      sourceUrl: { type: String }
    }],
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 7. API Specifications & Endpoints

| Category | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register new student profile | No |
| **Auth** | `POST` | `/api/auth/login` | Authenticate & set secure cookie | No |
| **Auth** | `POST` | `/api/auth/refresh` | Rotate access token | Yes (Cookie) |
| **Auth** | `POST` | `/api/auth/logout` | Invalidate active session | Yes |
| **Resources**| `GET` | `/api/resources` | Query resources (filters, pagination, sort)| Optional |
| **Resources**| `GET` | `/api/resources/:id` | Fetch resource detail & download link | Optional |
| **Resources**| `POST` | `/api/resources` | Upload new public resource | Yes (`class_rep` / `admin`)|
| **Resources**| `POST` | `/api/resources/:id/upvote` | Toggle upvote on resource | Yes |
| **Vault** | `GET` | `/api/assignments` | List student's assignments & files | Yes |
| **Vault** | `POST` | `/api/assignments` | Create assignment card with files | Yes |
| **Vault** | `POST` | `/api/assignments/:id/files` | Upload additional file to assignment | Yes |
| **Vault** | `GET` | `/api/assignments/:id/download/:fileId` | Generate signed download URL | Yes |
| **Vault** | `PATCH`| `/api/assignments/:id/status`| Update status (`pending`, `completed`)| Yes |
| **Vault** | `DELETE`| `/api/assignments/:id` | Remove assignment and associated files| Yes |
| **RAG / AI** | `POST` | `/api/chat/sessions` | Create a new conversation session | Yes |
| **RAG / AI** | `POST` | `/api/chat/sessions/:id/message` | Send prompt & receive SSE streaming answer | Yes |
| **RAG / AI** | `POST` | `/api/chat/index-file` | Trigger vector parsing & embedding on doc | Yes |
| **RAG / AI** | `GET` | `/api/chat/sessions` | List previous chat conversations | Yes |

---

## 8. RAG (Retrieval-Augmented Generation) Workflow

```
1. Document Ingestion
   [Student Uploads PDF/DOCX]
              │
              ▼
   [Express Multer Receiver] ──► [storageService (Save to S3/Cloud)]
              │
              ▼
   [documentParser (Extract Raw Text & Page Offsets)]
              │
              ▼
   [ragService.chunkText() (600-token chunks with 100 overlap)]
              │
              ▼
   [OpenAI / Embeddings API (text-embedding-3-small)]
              │
              ▼
   [Save to MongoDB DocumentChunk Collection with Vector Index]

─────────────────────────────────────────────────────────────

2. Contextual Question Answering
   [Student asks: "Explain Deadlock avoidance from Unit 3"]
              │
              ▼
   [Vectorize Question Query]
              │
              ▼
   [Vector Search Match: Filter by (userId == current OR isPublic == true)]
              │
              ▼
   [Retrieve Top 5 Chunks + Page References]
              │
              ▼
   [Construct System Prompt with Strict Grounding Guardrails]
   "Answer strictly based on the provided student notes below. 
    If not found, clearly state 'Information not found in your notes'. 
    Cite [Document Name, Page X] for every claim."
              │
              ▼
   [Stream LLM Tokens via Server-Sent Events (SSE) to React UI]
```

---

## 9. Non-Functional & Security Requirements

1. **Security & Data Privacy:**
   - Strict tenant isolation: Student A cannot vectorize, retrieve, or view files uploaded to Student B’s private vault.
   - Presigned storage URLs with 15-minute expiration for file downloads.
   - Input sanitization against prompt injection (e.g., separating user questions from retrieved context with explicit delimiters).
   - Rate limiting on RAG endpoints (e.g., max 30 queries per 15 minutes per student).
2. **Performance:**
   - Search response time $< 150\text{ms}$ for metadata queries.
   - Vector search retrieval $< 250\text{ms}$.
   - Time-to-First-Token (TTFT) for RAG responses $< 1.2\text{s}$ using SSE streaming.
3. **Accessibility & Responsive Standards:**
   - WCAG 2.1 AA compliance (contrast ratios $\ge 4.5:1$).
   - Full keyboard navigation for dialogs, file tables, and search modals.
   - Mobile-responsive layout ensuring comfortable file preview and chatting on smartphones and tablets.

---

## 10. Phased Implementation Roadmap

```
Phase 1: Foundation & Core MVC (Week 1–2)
├── Setup Express MVC boilerplate & MongoDB schema connections
├── Implement JWT Auth, Registration, and User Profile management
├── Establish React frontend with warm, human-crafted design tokens
└── Setup AWS S3 / Cloud storage integration

Phase 2: Academic Repository & Assignment Vault (Week 3–4)
├── Implement Course & Subject hierarchy navigation
├── Build Resource Hub with filters, search, and upvote system
├── Develop Student Vault with drag-and-drop file upload & progress
└── Implement PDF in-browser previewer and download engine

Phase 3: RAG Document Pipeline & Chatbot (Week 5–6)
├── Build Document Parser (PDF/DOCX to text chunker)
├── Setup Vector Search in MongoDB Atlas Vector Search
├── Implement streaming chat endpoint with LangChain / OpenAI
└── Integrate side-by-side Study Mode (Split PDF viewer + RAG chat)

Phase 4: Polish, Testing & Deployment (Week 7)
├── Human UX refinements (micro-animations, keyboard shortcuts)
├── Rate limiting, error boundaries, security audit
└── Containerization (Docker) & cloud deployment
```

---

## 11. Success Metrics & KPIs
- **Engagement:** Daily Active Users (DAU) / Monthly Active Users (MAU) ratio $\ge 45\%$.
- **RAG Accuracy & Hallucination Rate:** $\le 2\%$ grounded hallucination rate verified through citation checks.
- **Speed to Resource:** Average student time from opening the app to finding their target PYQ or note $< 15$ seconds.
- **User Satisfaction:** Net Promoter Score (NPS) $\ge 60$ emphasizing clarity, absence of clutter, and zero "AI slop" feeling.
