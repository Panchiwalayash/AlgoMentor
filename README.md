# AlgoMentor

Voice-first DSA tutoring for college students. Talk through coding problems with an AI mentor grounded in curated study material — not generic LLM guesses.

## Architecture

- **Frontend** (`voice-ai-tutor/`) — Next.js app on Vercel. Mints LiveKit tokens, stores sessions in Supabase.
- **Agent** (`agent/`) — Python LiveKit worker on Render. Groq for STT/LLM/TTS, local HuggingFace embeddings + ChromaDB for RAG.
- **LiveKit Cloud** — WebRTC voice rooms connecting browser and agent.

## Environment Variables

### Frontend (`voice-ai-tutor/.env.local`)

| Variable | Purpose |
|----------|---------|
| `LIVEKIT_URL` | LiveKit WebSocket URL |
| `LIVEKIT_API_KEY` | Token minting |
| `LIVEKIT_API_SECRET` | Token signing |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side conversation storage |

### Agent (`agent/.env`)

| Variable | Purpose |
|----------|---------|
| `LIVEKIT_URL` | Agent connection |
| `LIVEKIT_API_KEY` | Agent auth |
| `LIVEKIT_API_SECRET` | Agent auth |
| `GROQ_API_KEY` | STT, LLM, and TTS |

## Local Development

### 1. Supabase

Run the SQL in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL editor.

### 2. Agent

```bash
cd agent
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # fill in keys
python scripts/build_index.py
python main.py dev
```

### 3. Frontend

```bash
cd voice-ai-tutor
npm install
copy .env.example .env.local  # fill in keys
npm run dev
```

Open [http://localhost:3000/course](http://localhost:3000/course), pick a topic, and start talking.

## Deployment

| Service | Platform | Root directory |
|---------|----------|----------------|
| Frontend | [Vercel](https://vercel.com) | `voice-ai-tutor/` |
| Agent | [Render](https://render.com) | `agent/` (uses Dockerfile + render.yaml) |
| Voice infra | [LiveKit Cloud](https://cloud.livekit.io) | — |
| Database | [Supabase](https://supabase.com) | — |

Add the env vars from the tables above to each platform's dashboard.

## RAG Content

Study material lives in `agent/course_material/` as structured markdown with YAML frontmatter. Each topic has intuition, templates, examples, common mistakes, and practice problems. Rebuild the index after editing content:

```bash
cd agent
python scripts/build_index.py
```

## Topics (MVP)

- Binary Search
- Linked Lists
- Trees & BST

Additional topics (two-pointers, graphs, DP) are listed in the UI; add markdown content under `agent/course_material/` to enable full RAG coverage.

## License

MIT
