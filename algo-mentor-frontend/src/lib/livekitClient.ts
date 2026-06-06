import { LogLevel, LoggerNames, setLogLevel } from "livekit-client";

if (typeof window !== "undefined") {
  setLogLevel(LogLevel.silent);
  for (const loggerName of Object.values(LoggerNames)) {
    setLogLevel(LogLevel.silent, loggerName);
  }
}
