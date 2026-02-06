import { useState } from "react";
import { useHealth } from "@/hooks/useHealth";
import { ChatTab } from "@/components/ChatTab";
import { AdminTab } from "@/components/AdminTab";
import { MessageCircle, Settings } from "lucide-react";

type Tab = "chat" | "admin";

const Index = () => {
  const [tab, setTab] = useState<Tab>("chat");
  const healthy = useHealth();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-5 h-12 border-b bg-card shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-base font-bold tracking-tight mr-4">Cora</span>
          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === "chat"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chatbot
          </button>
          <button
            onClick={() => setTab("admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === "admin"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Health indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              healthy === null
                ? "bg-muted-foreground/40"
                : healthy
                ? "bg-success"
                : "bg-destructive"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {healthy === null ? "Checking…" : healthy ? "Connected" : "Offline"}
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "chat" ? <ChatTab /> : <AdminTab />}
      </div>
    </div>
  );
};

export default Index;
