import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { IntakeConfig } from "@/types/intake";
import { SystemPromptBuilder } from "./admin/SystemPromptBuilder";
import { InstructionsEditor } from "./admin/InstructionsEditor";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  Save,
  Loader2,
  Code,
  Layers,
  Workflow,
  FileText,
} from "lucide-react";

type ViewMode = "visual" | "json";
type AdminSection = "intake" | "instructions";

export function AdminTab() {
  const [section, setSection] = useState<AdminSection>("intake");

  // --- Intake state ---
  const [config, setConfig] = useState<IntakeConfig>({
    program: "",
    start_step: "",
    steps: [],
  });
  const [json, setJson] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("visual");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  const syncJsonFromConfig = useCallback((c: IntakeConfig) => {
    setJson(JSON.stringify(c, null, 2));
    setJsonParseError(null);
  }, []);

  const loadIntake = async () => {
    setLoading(true);
    setErrors([]);
    setStatus("idle");
    try {
      const data = await api.getIntake();
      const parsed = data as IntakeConfig;
      setConfig(parsed);
      syncJsonFromConfig(parsed);
    } catch (e) {
      setErrors([(e as Error).message]);
    }
    setLoading(false);
  };

  useEffect(() => { loadIntake(); }, []);

  const switchToVisual = () => {
    try {
      const parsed = JSON.parse(json) as IntakeConfig;
      setConfig(parsed);
      setJsonParseError(null);
      setViewMode("visual");
    } catch {
      setJsonParseError("Invalid JSON — fix before switching to visual mode");
    }
  };

  const switchToJson = () => {
    syncJsonFromConfig(config);
    setViewMode("json");
  };

  const handleConfigChange = (newConfig: IntakeConfig) => {
    setConfig(newConfig);
    setJson(JSON.stringify(newConfig, null, 2));
  };

  const validate = async () => {
    setErrors([]);
    try {
      const res = await api.validateIntake();
      if (res.ok) {
        setErrors([]);
        setStatus("idle");
      } else {
        setErrors(res.errors || ["Validation failed"]);
      }
    } catch (e) {
      setErrors([(e as Error).message]);
    }
  };

  const save = async () => {
    setErrors([]);
    let parsed: unknown;
    const jsonToSave = viewMode === "visual" ? JSON.stringify(config) : json;
    try {
      parsed = JSON.parse(jsonToSave);
    } catch {
      setErrors(["Invalid JSON syntax"]);
      return;
    }
    setStatus("saving");
    try {
      const valRes = await api.validateIntake();
      if (!valRes.ok) {
        setErrors(valRes.errors || ["Validation failed"]);
        setStatus("error");
        return;
      }
      await api.saveIntake(parsed);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setErrors([(e as Error).message]);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section tabs */}
      <div className="flex items-center gap-1 px-5 pt-3 pb-0 bg-card shrink-0">
        <button
          onClick={() => setSection("intake")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border border-b-0 transition-colors ${
            section === "intake"
              ? "bg-background text-foreground border-border"
              : "text-muted-foreground hover:text-foreground border-transparent bg-transparent"
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          Intake Builder
        </button>
        <button
          onClick={() => setSection("instructions")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border border-b-0 transition-colors ${
            section === "instructions"
              ? "bg-background text-foreground border-border"
              : "text-muted-foreground hover:text-foreground border-transparent bg-transparent"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Instructions Editor
        </button>
      </div>
      <div className="border-b bg-card" />

      {section === "instructions" ? (
        <InstructionsEditor />
      ) : (
        <>
          {/* Intake header */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-card shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">Intake Configuration</h2>
              <div className="flex items-center bg-secondary rounded-lg p-0.5">
                <button
                  onClick={viewMode === "visual" ? undefined : switchToVisual}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    viewMode === "visual"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  Visual
                </button>
                <button
                  onClick={viewMode === "json" ? undefined : switchToJson}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    viewMode === "json"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code className="w-3 h-3" />
                  Raw JSON
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadIntake}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
              >
                <Download className="w-3.5 h-3.5" />
                Reload
              </button>
              <button
                onClick={validate}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Validate
              </button>
              <button
                onClick={save}
                disabled={status === "saving"}
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

          {/* Errors banner */}
          {(errors.length > 0 || jsonParseError) && (
            <div className="mx-5 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              {jsonParseError && (
                <div className="flex items-start gap-2 text-xs text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {jsonParseError}
                </div>
              )}
              {errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {viewMode === "visual" ? (
              <SystemPromptBuilder config={config} onChange={handleConfigChange} />
            ) : (
              <div className="p-5 h-full">
                <textarea
                  value={json}
                  onChange={(e) => {
                    setJson(e.target.value);
                    setJsonParseError(null);
                  }}
                  spellCheck={false}
                  className="w-full h-full font-mono text-xs bg-secondary rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-ring scrollbar-thin"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
