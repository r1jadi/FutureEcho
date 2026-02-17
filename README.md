# 🚀 Future Echo

AI-powered journaling platform that simulates conversations with your **future self**.

Future Echo is a production-ready full-stack SaaS application that combines long-term memory retrieval, emotional pattern tracking, and AI simulation to help users reflect, grow, and make better decisions.

---

## ✨ Features

- 🔐 Secure Authentication (JWT / NextAuth)
- 📝 Rich Journal System (create, edit, delete, tags, mood tracking)
- 🤖 Future Self AI Chat (Gemini-powered)
- 🧠 Long-Term Memory Retrieval using Vector Embeddings
- 🔓 Time-Locked Messages
- 📊 Growth Dashboard (mood trends, entry frequency, goal tracking)
- 🌙 Premium Dark Mode UI
- 🐳 Docker-ready
- 🚀 Deployable to Vercel / Railway

---

## 🧠 How It Works

Future Echo uses:

- Vector embeddings to store semantic memory of journal entries  
- Retrieval-based context assembly  
- Google Gemini for AI generation  
- A system prompt that simulates a wiser “5-years-ahead” version of the user  

### Chat Flow

1. User sends a message.
2. Relevant past journal entries are retrieved using embeddings.
3. Mood trends and goals are included.
4. Secure context is assembled.
5. Gemini generates a reflective, emotionally intelligent response.

---

## 🏗 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Recharts

### Backend
- Next.js API Routes
- TypeScript

### Database
- PostgreSQL
- Prisma ORM

### AI
- Google Gemini (`still not fully implemented`)
- `loading` for embeddings

### Deployment
- Docker
- Vercel / Railway compatible

---

## 📂 Project Structure

```
future-echo/
│
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
├── lib/
│   ├── ai/                 # Gemini integration
│   ├── db/                 # Prisma client
│   ├── embeddings/         # Vector embedding logic
│   └── utils/              # Helper utilities
├── prisma/                 # Prisma schema
├── public/
├── styles/
├── Dockerfile
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```
DATABASE_URL=
GEMINI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## 🧪 Local Development

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Run Prisma migrations:

```
npx prisma migrate dev
```

---

## 🐳 Docker Setup

Build Docker image:

```
docker build -t future-echo .
```

Run container:

```
docker run -p 3000:3000 future-echo
```

---

## 🔐 Security

- API keys stored server-side only
- Input validation on all routes
- Rate limiting on AI endpoints
- Prompt injection safeguards
- Secure context assembly pipeline
- Protected API routes

---

## 📊 Architecture Overview

Future Echo follows a modular service-based architecture:

- AI abstraction layer
- Memory retrieval service
- Embedding service
- Chat session manager
- Secure API layer
- Clean UI component separation

This architecture allows future support for:
- Multiple AI providers
- Mobile app integration
- Enterprise features
- Scalable SaaS expansion

---

## 🚀 Deployment

### Deploy on Vercel

1. Push project to GitHub.
2. Import repository into Vercel.
3. Add environment variables.
4. Deploy.

### Deploy on Railway

1. Create new Railway project.
2. Connect repository.
3. Add PostgreSQL plugin.
4. Configure environment variables.
5. Deploy.

---

## 🎯 Future Roadmap

- Voice-based Future Self
- Mobile App (React Native)
- Habit tracking system
- AI life projection mode
- Multi-provider AI toggle (Claude / Gemini / OpenAI)

---

## 👨‍💻 Author

Built by Rijad Halili

---

## 📜 License

MIT License

---
