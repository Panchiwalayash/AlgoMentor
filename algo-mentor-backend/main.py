import asyncio
import json
import logging
import os
import sys
import threading
from aiohttp import web

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    AutoSubscribe,
    JobContext,
    JobProcess,
    cli,
    inference,
    stt,
    tts,
)
from livekit.agents.llm.chat_context import Instructions
from livekit.plugins import groq, silero

try:
    from livekit.plugins import cartesia
except ImportError:
    cartesia = None

from prompts import get_prompt
from rag_manager import get_rag_manager

load_dotenv()

logging.getLogger("livekit.agents").setLevel(logging.INFO)



async def get_participant_metadata(ctx: JobContext) -> dict:
    try:
        participant = await ctx.wait_for_participant()
        if participant and participant.metadata:
            try:
                metadata = json.loads(participant.metadata)
                print(metadata, flush=True)
                return metadata
            except json.JSONDecodeError:
                print("Failed to parse metadata JSON")
    except Exception as e:
        print(f"Error while waiting for participants: {e}")
    print("Using default metadata")
    return {"context": "voice-ai"}


def _float_env(name: str, default: float) -> float:
    return float(os.getenv(name, str(default)))


def _int_env(name: str, default: int) -> int:
    return int(os.getenv(name, str(default)))


def load_vad() -> silero.VAD:
    sample_rate = int(os.getenv("SILERO_SAMPLE_RATE", "16000"))
    if sample_rate not in (8000, 16000):
        sample_rate = 16000

    return silero.VAD.load(
        sample_rate=sample_rate,  # type: ignore[arg-type]
        min_silence_duration=_float_env("SILERO_MIN_SILENCE", 0.4),
        min_speech_duration=_float_env("SILERO_MIN_SPEECH", 0.05),
    )


def build_stt(groq_key: str) -> stt.STT:
    return groq.STT(
        model=os.getenv("GROQ_STT_MODEL", "whisper-large-v3-turbo"),
        api_key=groq_key,
    )


def build_tts(groq_key: str) -> tts.TTS:
    provider = os.getenv("TTS_PROVIDER", "livekit").lower()
    if provider == "groq":
        return tts.StreamAdapter(
            tts=groq.TTS(
                model=os.getenv("GROQ_TTS_MODEL", "canopylabs/orpheus-v1-english"),
                voice=os.getenv("GROQ_TTS_VOICE", "autumn"),
                api_key=groq_key,
            )
        )
    elif provider == "cartesia":
        if cartesia is None:
            raise ImportError("livekit-plugins-cartesia is not installed. Add it to requirements.txt and install it.")
        return cartesia.TTS(
            model=os.getenv("CARTESIA_TTS_MODEL", "sonic-english"),
            voice=os.getenv("CARTESIA_TTS_VOICE", "6f84f4b8-58a2-430c-8c79-688dad597532"),
            api_key=os.getenv("CARTESIA_API_KEY"),
        )

    return inference.TTS(
        model=os.getenv("LIVEKIT_TTS_MODEL", "cartesia/sonic-2"),
        voice=os.getenv("LIVEKIT_TTS_VOICE", "6f84f4b8-58a2-430c-8c79-688dad597532"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"),
    )


class AlgoMentorAgent(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(
            instructions=instructions
            if isinstance(instructions, Instructions)
            else Instructions(instructions)
        )


agent_port = int(os.getenv("LIVEKIT_AGENT_PORT", "7861"))
server = AgentServer(
    host="0.0.0.0",
    port=agent_port,
    num_idle_processes=2,
)


def prewarm(proc: JobProcess) -> None:
    proc.userdata["vad"] = load_vad()
    proc.userdata["rag_manager"] = get_rag_manager()


server.setup_fnc = prewarm



@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    metadata = await get_participant_metadata(ctx)
    rag_manager = ctx.proc.userdata.get("rag_manager") or get_rag_manager()
    prompt = get_prompt(metadata.get("context", "voice-ai"), metadata, rag_manager=rag_manager)

    groq_key = os.getenv("GROQ_API_KEY")




    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        stt=build_stt(groq_key),
        llm=groq.LLM(
            model=os.getenv("GROQ_LLM_MODEL", "openai/gpt-oss-20b"),
            api_key=groq_key,
            temperature=_float_env("GROQ_LLM_TEMPERATURE", 0.6),
            max_completion_tokens=_int_env("GROQ_LLM_MAX_TOKENS", 120),
        ),
        tts=build_tts(groq_key),
        turn_handling={
            "endpointing": {
                "min_delay": _float_env("TURN_MIN_DELAY", 0.3),
                "max_delay": _float_env("TURN_MAX_DELAY", 1.0),
            },
            "preemptive_generation": {"enabled": True},
        },
        aec_warmup_duration=0,
    )

    agent = AlgoMentorAgent(instructions=prompt.get_system_prompt())

    await session.start(agent=agent, room=ctx.room)

    greeting = session.say(
        prompt.get_initial_greeting(),
        allow_interruptions=False,
    )
    await greeting.wait_for_playout()


async def _health_handler(request):
    return web.json_response({
        "status": "online",
        "app": "AlgoMentor DSA Voice Mentor"
    })


def start_keepalive_server():
    def _run():
        port = int(os.getenv("PORT", "7860"))
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        app = web.Application()
        app.router.add_get("/", _health_handler)
        app.router.add_get("/health", _health_handler)
        app.router.add_get("/ping", _health_handler)
        runner = web.AppRunner(app)
        loop.run_until_complete(runner.setup())
        site = web.TCPSite(runner, "0.0.0.0", port)
        loop.run_until_complete(site.start())
        print(f"[AlgoMentor Keep-Alive] HTTP server running on http://0.0.0.0:{port}", flush=True)
        loop.run_forever()

    t = threading.Thread(target=_run, daemon=True)
    t.start()


if __name__ == "__main__":
    print("[AlgoMentor] Initializing RAG index and HTTP Keep-Alive server...", flush=True)
    try:
        get_rag_manager().build_index()
        print("[AlgoMentor] RAG index initialized successfully.", flush=True)
    except Exception as e:
        print(f"[AlgoMentor] Warning: RAG index build error: {e}", flush=True)

    start_keepalive_server()
    cli.run_app(server)

