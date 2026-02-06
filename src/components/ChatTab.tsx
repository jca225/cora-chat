import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { ProgramSelector } from "@/components/ProgramSelector";
import { MessageSquarePlus, RotateCcw, Send } from "lucide-react";

export function ChatTab() {
  const {
    messages,
    streaming,
    loading,
    selectedProgram,
    choicePayload,
    initialize,
    sendMessage,
    newChat,
    resetChat,
  } = useChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, choicePayload]);

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    sendMessage(input.trim());
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New chat
          </button>
          <button
            onClick={resetChat}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
        {selectedProgram && (
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {selectedProgram}
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : messages.length === 0 && !choicePayload ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Welcome to Cora</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start a conversation to begin your session.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isLastAssistant =
                msg.role === "assistant" && i === messages.length - 1;
              return (
                <ChatMessageBubble
                  key={i}
                  message={msg}
                  isStreaming={isLastAssistant && streaming}
                />
              );
            })}
            {choicePayload && !streaming && (
              <ProgramSelector
                payload={choicePayload}
                onSelect={(val) => sendMessage(val)}
              />
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-2">
        <div className="flex items-end gap-2 bg-secondary rounded-2xl px-4 py-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-40 py-1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
