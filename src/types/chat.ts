export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts?: string;
}

export interface ConversationState {
  conversation_id: string;
  intake_step: number | null;
  selected_program: string | null;
  program: string | null;
  intake_state: Record<string, unknown> | null;
  messages: ChatMessage[];
}

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface ChoicePayload {
  reply: string;
  kind: "choice";
  action: "select_program";
  options: ChoiceOption[];
  question_id: string;
  conversation_id: string;
}

export interface ReplyPayload {
  reply: string;
  conversation_id: string;
}

export type ChatResponse = ChoicePayload | ReplyPayload;

export function isChoicePayload(res: ChatResponse): res is ChoicePayload {
  return "kind" in res && res.kind === "choice";
}

export interface Programs {
  programs: Record<string, string>;
}
