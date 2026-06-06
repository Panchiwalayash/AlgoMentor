import { ParticipantAgentAttributes } from "@livekit/components-core";
import { useRemoteParticipants } from "@livekit/components-react";
import { ParticipantKind } from "livekit-client";

export function useAgentParticipant() {
  const remoteParticipants = useRemoteParticipants();

  return remoteParticipants.find(
    (participant) =>
      participant.kind === ParticipantKind.AGENT &&
      !(ParticipantAgentAttributes.PublishOnBehalf in participant.attributes)
  );
}
