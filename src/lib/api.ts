const BASE = (import.meta.env.VITE_API_BASE as string) || "http://demo.cognifica.ai/chatbot";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),

  createConversation: () =>
    request<{ conversation_id: string }>("/api/conversations", { method: "POST" }),

  getActiveConversation: () =>
    request<{ conversation_id: string }>("/api/conversations/active"),

  resetConversation: (id: string) =>
    request<{ ok: boolean }>(`/api/conversations/${id}/reset`, { method: "POST" }),

  getMessages: (id: string) =>
    request<import("@/types/chat").ConversationState>(`/api/conversations/${id}/messages`),

  getPrograms: () => request<import("@/types/chat").Programs>("/api/programs"),

  chat: (conversationId: string | null, message: string) =>
    request<import("@/types/chat").ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ conversation_id: conversationId, message }),
    }),

  chatStream: (
    conversationId: string | null,
    message: string,
    onDelta: (chunk: string) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ) => {
    const controller = new AbortController();

    fetch(`${BASE}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId, message }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Stream ${res.status}`);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            const dataLines = event
              .split("\n")
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5));
            if (!dataLines.length) continue;
            const payload = dataLines.join("\n");
            if (payload.trim() === "[DONE]") {
              onDone();
              return;
            }
            onDelta(payload);
          }
        }
        onDone();
      })
      .catch((err) => {
        if (err.name !== "AbortError") onError(err);
      });

    return controller;
  },

  // Admin
  getIntake: () => request<unknown>("/api/admin/intake"),
  saveIntake: (config: unknown) =>
    request<{ ok: boolean }>("/api/admin/intake", {
      method: "PUT",
      body: JSON.stringify(config),
    }),
  validateIntake: () =>
    request<{ ok: boolean; errors: string[] }>("/api/admin/intake/validate"),

  // Instructions
  getInstruction: (program: string) =>
    request<{ program: string; text: string }>(`/api/admin/instructions/${encodeURIComponent(program)}`),
  putInstruction: (program: string, text: string) =>
    request<{ ok: boolean; program: string }>(`/api/admin/instructions/${encodeURIComponent(program)}`, {
      method: "PUT",
      body: JSON.stringify({ text }),
    }),
};
