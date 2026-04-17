# DocuMind — MERN Stack RAG Application

A full-stack Retrieval-Augmented Generation (RAG) application built with the MERN stack and Google Gemini AI. Upload documents, ask questions, and get precise AI-powered answers grounded in your own documents.

---

## ✨ Features

- 🔐 JWT-based authentication (signup/login)
- 📄 Upload PDF, DOCX, TXT documents
- ✂️ Automatic text chunking with overlap
- 🧠 Embeddings via Google Gemini `text-embedding-004`
- 🔎 Semantic search with cosine similarity
- 🤖 Answer generation using Gemini 1.5 Flash
- 💾 Full search history with source tracking
- 📊 Similarity scores shown per source
- 🗑️ Delete documents and history entries
- ⚙️ Adjustable topK and similarity threshold

---

## 🏗️ Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React 18, React Router v6, Axios |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB (Atlas or local)      |
| AI         | Google Gemini (embeddings + LLM) |
| Auth       | JWT + bcryptjs                |
| File Parse | pdf-parse, mammoth            |

---

## 📁 Project Structure

```
rag-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── askController.js
│   │   ├── uploadController.js
│   │   └── historyController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Chunk.js
│   │   └── History.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── ask.js
│   │   ├── upload.js
│   │   └── history.js
│   ├── services/
│   │   ├── chunkService.js
│   │   ├── embeddingService.js
│   │   ├── extractionService.js
│   │   ├── llmService.js
│   │   └── vectorSearchService.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/
        │   ├── ChatBox.js
        │   ├── Message.js
        │   ├── Navbar.js
        │   └── UploadForm.js
        ├── context/AuthContext.js
        ├── pages/
        │   ├── ChatPage.js
        │   ├── HistoryPage.js
        │   ├── LoginPage.js
        │   └── SignupPage.js
        ├── services/api.js
        ├── App.js
        ├── index.js
        ├── index.css
        └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works) OR local MongoDB
- Google AI Studio API key (free at https://aistudio.google.com)

---

### 1. Clone & navigate

```bash
# Extract the project, then:
cd rag-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ragdb
JWT_SECRET=some_long_random_secret_string_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Getting a Gemini API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy the key into `.env`

**Getting MongoDB URI:**
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<password>` with your DB password

```bash
# Start backend
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy env file (optional — defaults to /api proxy)
cp .env.example .env

# Start frontend
npm start
# App runs on http://localhost:3000
```

---

## 🔁 How the RAG Pipeline Works

### Upload Flow
```
User uploads file
  → Extract text (pdf-parse / mammoth / fs)
  → Split into 800-char chunks with 150-char overlap
  → Generate Gemini embedding for each chunk
  → Store chunks + embeddings in MongoDB
```

### Query Flow
```
User asks question
  → Generate Gemini embedding for question
  → Compute cosine similarity against all user's chunks
  → Filter by threshold (default 30%), return top-K
  → Send question + top chunks to Gemini 1.5 Flash
  → Return grounded answer + source details
  → Save Q&A to history
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload & process document |
| GET | `/api/upload/documents` | List user's documents |
| DELETE | `/api/upload/documents/:id` | Delete document |

### Ask
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ask` | Ask a question (RAG pipeline) |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get paginated history |
| GET | `/api/history/:id` | Get single entry |
| DELETE | `/api/history/:id` | Delete single entry |
| DELETE | `/api/history` | Clear all history |

---

## ⚡ Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<strong random secret>
GEMINI_API_KEY=<your Gemini API key>
CLIENT_URL=http://localhost:3000
```

### Frontend `.env` (optional)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔧 Production Deployment Tips

1. **Backend**: Deploy to Railway, Render, or AWS EC2. Set environment variables in the platform dashboard.
2. **Frontend**: Build with `npm run build` and deploy to Vercel/Netlify.
3. **MongoDB Atlas**: Already cloud-hosted — just whitelist your server's IP.
4. **CORS**: Update `CLIENT_URL` in backend `.env` to your frontend production URL.
5. **JWT Secret**: Use a cryptographically random 64-char string in production.

---

## 📈 Scaling Notes

- **Vector Search**: For large document sets (10k+ chunks), replace manual cosine similarity with MongoDB Atlas Vector Search (`$vectorSearch` pipeline) for much better performance.
- **Rate limiting**: Add `express-rate-limit` to protect auth and ask endpoints.
- **File storage**: For production, store original files in S3/GCS instead of processing in-memory.
