import json
import logging
import os

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
    tts,
)
from livekit.agents.llm.chat_context import Instructions
from livekit.plugins import groq, silero

from prompts import get_prompt

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


def build_tts(groq_key: str) -> tts.TTS:
    if os.getenv("TTS_PROVIDER", "livekit").lower() == "groq":
        return tts.StreamAdapter(
            tts=groq.TTS(
                model=os.getenv("GROQ_TTS_MODEL", "canopylabs/orpheus-v1-english"),
                voice=os.getenv("GROQ_TTS_VOICE", "autumn"),
                api_key=groq_key,
            )
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


server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    metadata = await get_participant_metadata(ctx)
    prompt = get_prompt(metadata.get("context", "voice-ai"), metadata)
    groq_key = os.getenv("GROQ_API_KEY")

    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        stt=groq.STT(model="whisper-large-v3-turbo", api_key=groq_key),
        llm=groq.LLM(model="llama-3.3-70b-versatile", api_key=groq_key),
        tts=build_tts(groq_key),
        turn_handling={
            "endpointing": {"min_delay": 0.5, "max_delay": 2.5},
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


if __name__ == "__main__":
    cli.run_app(server)
