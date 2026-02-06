import { useCallback, useRef, useState } from "react";
import { api } from "@/lib/api";
import { ChatMessage, ChatResponse, isChoicePayload, ChoicePayload } from "@/types/chat";

const CONV_KEY = "cora_conversation_id";

export function useChat() {
  const [conversationId, setConversationId] = useState<string | null>(
    () => localStorage.getItem(CONV_KEY)
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [choicePayload, setChoicePayload] = useState<ChoicePayload | null>(null);

  const streamTextRef = useRef("");
  const rafRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const persistId = (id: string) => {
    setConversationId(id);
    localStorage.setItem(CONV_KEY, id);
  };

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const { conversation_id } = await api.getActiveConversation();
      persistId(conversation_id);
      const state = await api.getMessages(conversation_id);
      setMessages(state.messages || []);
      setSelectedProgram(state.program || state.selected_program || null);

      // Check if last assistant message was a choice
      if (!state.selected_program && state.messages?.length) {
        // We may need to re-render choice — trigger a non-stream chat with empty? 
        // Actually, let's just show the messages as-is
      }
    } catch {
      // Create new conversation
      try {
        const { conversation_id } = await api.createConversation();
        persistId(conversation_id);
        setMessages([]);
      } catch { /* silent */ }
    }
    setLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMsg: ChatMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setChoicePayload(null);

      // Try streaming first
      setStreaming(true);
      streamTextRef.current = "";

      const assistantMsg: ChatMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      let gotDelta = false;
      let flushScheduled = false;

      const flushUI = () => {
        flushScheduled = false;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: streamTextRef.current,
          };
          return updated;
        });
      };

      const scheduleFlush = () => {
        if (!flushScheduled) {
          flushScheduled = true;
          rafRef.current = requestAnimationFrame(flushUI);
        }
      };

      const controller = api.chatStream(
        conversationId,
        text,
        (chunk) => {
          gotDelta = true;
          // Check if this is a JSON choice payload
          try {
            const parsed = JSON.parse(chunk) as ChatResponse;
            if (isChoicePayload(parsed)) {
              setChoicePayload(parsed);
              streamTextRef.current = parsed.reply;
              scheduleFlush();
              return;
            }
            if ("reply" in parsed) {
              streamTextRef.current = parsed.reply;
              if (parsed.conversation_id) persistId(parsed.conversation_id);
              scheduleFlush();
              return;
            }
          } catch {
            // Not JSON, treat as text delta
          }
          streamTextRef.current += chunk;
          scheduleFlush();
        },
        () => {
          cancelAnimationFrame(rafRef.current);
          flushUI();
          setStreaming(false);
        },
        async () => {
          // Stream error — fallback to non-stream
          cancelAnimationFrame(rafRef.current);
          if (!gotDelta) {
            try {
              const res = await api.chat(conversationId, text);
              if (isChoicePayload(res)) {
                setChoicePayload(res);
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: res.reply };
                  return updated;
                });
              } else {
                if (res.conversation_id) persistId(res.conversation_id);
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: res.reply };
                  return updated;
                });
              }
            } catch {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: "Sorry, something went wrong. Please try again.",
                };
                return updated;
              });
            }
          }
          setStreaming(false);
        }
      );

      abortRef.current = controller;
    },
    [conversationId, streaming]
  );

  const newChat = useCallback(async () => {
    abortRef.current?.abort();
    setStreaming(false);
    setChoicePayload(null);
    try {
      const { conversation_id } = await api.createConversation();
      persistId(conversation_id);
      setMessages([]);
      setSelectedProgram(null);
    } catch { /* silent */ }
  }, []);

  const resetChat = useCallback(async () => {
    if (!conversationId) return;
    abortRef.current?.abort();
    setStreaming(false);
    setChoicePayload(null);
    try {
      await api.resetConversation(conversationId);
      const state = await api.getMessages(conversationId);
      setMessages(state.messages || []);
      setSelectedProgram(state.program || state.selected_program || null);
    } catch { /* silent */ }
  }, [conversationId]);

  return {
    messages,
    streaming,
    loading,
    conversationId,
    selectedProgram,
    choicePayload,
    initialize,
    sendMessage,
    newChat,
    resetChat,
  };
}
