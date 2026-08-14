import os
import sys
import threading
import asyncio
from aiohttp import web

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from rag_manager import get_rag_manager


async def _health_handler(request):
    rag = get_rag_manager()
    overview = rag.get_topic_overview("binary-search")
    return web.json_response({
        "status": "online",
        "app": "AlgoMentor DSA Voice Mentor",
        "message": "LiveKit agent worker is active & grounded RAG ready.",
        "active_topics": [
            "binary-search",
            "linked-lists",
            "trees",
            "graphs",
            "two-pointers",
            "dynamic-programming"
        ],
        "sample_topic": "binary-search",
        "binary_search_overview": overview[:350] + "..." if len(overview) > 350 else overview
    })


async def _topic_handler(request):
    topic_id = request.match_info.get("topic_id", "binary-search")
    rag = get_rag_manager()
    overview = rag.get_topic_overview(topic_id)
    snippets = rag.retrieve_context(topic_id, "overview intuition code edge cases", top_k=2)
    return web.json_response({
        "topic_id": topic_id,
        "overview": overview,
        "snippets": snippets
    })


def run_http_keepalive_server():
    port = int(os.getenv("PORT", "7860"))
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    app = web.Application()
    app.router.add_get("/", _health_handler)
    app.router.add_get("/health", _health_handler)
    app.router.add_get("/ping", _health_handler)
    app.router.add_get("/api/topic/{topic_id}", _topic_handler)

    runner = web.AppRunner(app)
    loop.run_until_complete(runner.setup())
    site = web.TCPSite(runner, "0.0.0.0", port)
    loop.run_until_complete(site.start())
    print(f"[AlgoMentor Keep-Alive] HTTP server running on http://0.0.0.0:{port}", flush=True)
    loop.run_forever()


def start_keepalive_thread():
    t = threading.Thread(target=run_http_keepalive_server, daemon=True)
    t.start()
