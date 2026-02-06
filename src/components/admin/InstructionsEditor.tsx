import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Save,
  Loader2,
  AlertTriangle,
  FileText,
  Eye,
  EyeOff,
  Circle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export function InstructionsEditor() {
  const [programs, setPrograms] = useState<Record<string, string>>({});
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<string | null>(null);

  const dirty = text !== savedText;

  // Load programs once
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getPrograms();
        setPrograms(res.programs);
        const keys = Object.keys(res.programs);
        if (keys.length > 0) setSelectedProgram(keys[0]);
      } catch (e) {
        setError((e as Error).message);
      }
      setProgramsLoading(false);
    })();
  }, []);

  // Load instruction when program changes
  const loadInstruction = useCallback(async (program: string) => {
    if (!program) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setStatus("idle");
    try {
      const res = await api.getInstruction(program);
      setText(res.text);
      setSavedText(res.text);
    } catch (e: any) {
      if (e.message?.includes("404")) {
        setText("");
        setSavedText("");
        setNotFound(true);
      } else {
        setError(e.message);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedProgram) loadInstruction(selectedProgram);
  }, [selectedProgram, loadInstruction]);

  const handleProgramSwitch = (newProgram: string) => {
    if (dirty) {
      setPendingSwitch(newProgram);
    } else {
      setSelectedProgram(newProgram);
    }
  };

  const confirmSwitch = (action: "save" | "discard" | "cancel") => {
    if (action === "save") {
      handleSave().then(() => {
        if (pendingSwitch) setSelectedProgram(pendingSwitch);
        setPendingSwitch(null);
      });
    } else if (action === "discard") {
      if (pendingSwitch) setSelectedProgram(pendingSwitch);
      setPendingSwitch(null);
    } else {
      setPendingSwitch(null);
    }
  };

  const handleSave = async () => {
    setError(null);
    setStatus("saving");
    try {
      await api.putInstruction(selectedProgram, text);
      setSavedText(text);
      setNotFound(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  };

  const handleReload = () => {
    if (dirty && !window.confirm("Discard unsaved changes and reload?")) return;
    loadInstruction(selectedProgram);
  };

  const programKeys = Object.keys(programs);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Instructions Editor</h2>
          {/* Program selector */}
          {!programsLoading && programKeys.length > 0 && (
            <Select value={selectedProgram} onValueChange={handleProgramSwitch}>
              <SelectTrigger className="h-7 w-48 text-xs">
                <SelectValue placeholder="Select program…" />
              </SelectTrigger>
              <SelectContent>
                {programKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {programs[key]} ({key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Dirty indicator */}
          {dirty && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Circle className="w-2 h-2 fill-primary text-primary" />
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((p) => !p)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            Preview
          </button>
          <button
            onClick={handleReload}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
          >
            <Download className="w-3.5 h-3.5" />
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={status === "saving" || !selectedProgram}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "saving" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {status === "saved" ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Error/warning banner */}
      {(error || notFound) && (
        <div className={`mx-5 mt-3 p-3 rounded-lg border ${error ? "bg-destructive/10 border-destructive/20" : "bg-primary/5 border-primary/20"}`}>
          <div className={`flex items-start gap-2 text-xs ${error ? "text-destructive" : "text-primary"}`}>
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {error || "No instruction file exists yet for this program. Save to create one."}
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className="flex-1 overflow-hidden flex">
        {programsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : programKeys.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            No programs available
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Text editor */}
            <div className="flex-1 p-5 overflow-hidden flex flex-col">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 font-mono text-xs bg-secondary rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-ring scrollbar-thin"
                placeholder="Enter instruction text for this program…"
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[11px] text-muted-foreground">
                  {text.length.toLocaleString()} characters
                </span>
                {dirty && (
                  <button
                    onClick={() => setText(savedText)}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset to saved
                  </button>
                )}
              </div>
            </div>

            {/* Markdown preview */}
            {showPreview && (
              <div className="w-80 xl:w-96 border-l p-5 overflow-y-auto scrollbar-thin">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-3">
                  Preview
                </span>
                <div className="prose-chat text-sm">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Unsaved changes dialog */}
      <Dialog open={!!pendingSwitch} onOpenChange={(o) => !o && setPendingSwitch(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Unsaved Changes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You have unsaved changes. What would you like to do?
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => confirmSwitch("cancel")}>
              Cancel
            </Button>
            <Button variant="outline" size="sm" onClick={() => confirmSwitch("discard")}>
              Discard
            </Button>
            <Button size="sm" onClick={() => confirmSwitch("save")}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
