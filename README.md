# AlgoMentor

Voice-first Data Structures & Algorithms (DSA) tutoring for college students. Talk through coding problems with an AI mentor grounded in curated topic material — not generic LLM guesses.

---

## Architecture

- **Frontend** ([`algo-mentor-frontend/`](algo-mentor-frontend/)) — Next.js app on Vercel. Mints LiveKit voice tokens and stores conversation sessions in Supabase.
- **Backend Agent** ([`algo-mentor-backend/`](algo-mentor-backend/)) — Python LiveKit worker hosted on Hugging Face Spaces. Uses Groq (STT/LLM/TTS) + local HuggingFace embeddings + ChromaDB for RAG context retrieval.
- **LiveKit Cloud** — WebRTC voice rooms connecting browser and agent.
- **Supabase** — PostgreSQL database storing session logs and conversation history.

---

## Environment Variables

### Frontend (`algo-mentor-frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `LIVEKIT_URL` | LiveKit WebSocket URL |
| `LIVEKIT_API_KEY` | Token minting API key |
| `LIVEKIT_API_SECRET` | Token signing secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side conversation storage key |

### Backend Agent (`algo-mentor-backend/.env`)

| Variable | Purpose |
|----------|---------|
| `LIVEKIT_URL` | LiveKit agent connection URL |
| `LIVEKIT_API_KEY` | Agent auth key |
| `LIVEKIT_API_SECRET` | Agent auth secret |
| `GROQ_API_KEY` | Groq STT, LLM, and TTS API key |
| `PORT` | Public HTTP keep-alive port (default `7860`) |

---

## Local Development

### 1. Database (Supabase)

Run the SQL script in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL editor.

### 2. Backend Agent

```bash
cd algo-mentor-backend
conda activate voice-ai
pip install -r requirements.txt
copy .env.example .env        # fill in API keys
python build_index.py         # builds/updates RAG vector index
python main.py dev            # starts LiveKit worker & HTTP server
```

### 3. Frontend

```bash
cd algo-mentor-frontend
npm install
copy .env.example .env.local  # fill in API keys
npm run dev
```

Open [http://localhost:3000/course](http://localhost:3000/course), select a topic (e.g. Binary Search, Trees, DP), and start talking.

---

## RAG System (Retrieval-Augmented Generation)

Course material is stored as structured Markdown in [`algo-mentor-backend/course_material/`](algo-mentor-backend/course_material/).

### Covered Topics
- **Binary Search** (`binary-search.md`)
- **Linked Lists** (`linked-lists.md`)
- **Trees & BST** (`trees.md`)
- **Graphs BFS/DFS** (`graphs.md`)
- **Two Pointers** (`two-pointers.md`)
- **Dynamic Programming** (`dynamic-programming.md`)

Each file contains YAML frontmatter, concept overviews, core intuition, Python templates, edge cases & pitfalls, complexity analysis, and top interview practice problems.

### Rebuilding RAG Index
Whenever you add or modify a topic file in `course_material/`, re-index:
```bash
python build_index.py
```
*(Note: `main.py` also automatically initializes and verifies the RAG index on boot.)*

---

## How to Verify RAG is Active & Grounding LLM

You can verify that the LLM is actively receiving grounded RAG material using **3 methods**:

### 1. Terminal / Server Console Log
When a user connects to a voice session for a topic, `main.py` logs:
```text
[RAG Grounding] Connected session for topic: 'binary-search' — RAG study material injected into LLM prompt.
```

### 2. HTTP RAG Context API Endpoint
Open your browser or run curl to inspect the exact RAG overview and context snippets injected into the LLM:
```bash
curl http://localhost:7860/api/topic/binary-search
```
*(On production: `https://nikhil8780-algomentor.hf.space/api/topic/binary-search`)*

### 3. In-Session Voice Testing
Ask the voice mentor topic-specific questions grounded in your course material:
- *"What is the integer overflow pitfall in binary search?"*
- *"What is the 5-step framework for dynamic programming?"*
- *"How do fast and slow pointers work on linked lists?"*

The AI mentor will respond using the exact intuition, edge cases, and code templates from `course_material/`.

---

## 24/7 Deployment & UptimeRobot Setup

| Service | Platform | Root Directory |
|---------|----------|----------------|
| Frontend | [Vercel](https://vercel.com) | `algo-mentor-frontend/` |
| Backend Agent | [Hugging Face Spaces](https://huggingface.co/spaces/Nikhil8780/AlgoMentor) | `algo-mentor-backend/` (Dockerfile) |
| Voice Infra | [LiveKit Cloud](https://cloud.livekit.io) | — |
| Database | [Supabase](https://supabase.com) | — |

### Preventing Hugging Face Spaces Auto-Sleep
To keep your Hugging Face Space active 24/7 without going idle:

1. Create a free account on [UptimeRobot](https://uptimerobot.com/).
2. Add a new monitor:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `AlgoMentor HF Keepalive`
   - **URL**: `https://nikhil8780-algomentor.hf.space/health` *(or `/api/topic/binary-search`)*
   - **Monitoring Interval**: `5 minutes`
3. Click **Create Monitor**.

Every 5 minutes, UptimeRobot hits port 7860, receives `HTTP 200 OK` with live RAG topic info, keeping your space active permanently.

---

## License

MIT
