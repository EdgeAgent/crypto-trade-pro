export type BotStatus = "staged" | "active" | "paused" | "stopped";
export type BotAction = "activate" | "pause" | "resume" | "stop" | "restart";

export function transitionBotStatus(status: BotStatus, action: BotAction): BotStatus {
  if (action === "activate" && status === "staged") return "active";
  if (action === "pause" && status === "active") return "paused";
  if (action === "resume" && status === "paused") return "active";
  if (action === "stop" && (status === "active" || status === "paused")) return "stopped";
  if (action === "restart" && status === "stopped") return "active";
  return status;
}
