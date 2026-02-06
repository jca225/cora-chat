import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Download, CheckCircle, AlertTriangle, Save, Loader2 } from "lucide-react";

export function AdminTab() {
  const [json, setJson] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const loadIntake = async () => {
    setLoading(true);
    setErrors([]);
    setStatus("idle");
    try {
      const data = await api.getIntake();
      setJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setErrors([(e as Error).message]);
    }
    setLoading(false);
  };

  useEffect(() => { loadIntake(); }, []);

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
    try {
      parsed = JSON.parse(json);
    } catch {
      setErrors(["Invalid JSON syntax"]);
      return;
    }
    setStatus("saving");
    try {
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
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
        <h2 className="text-sm font-semibold">Intake Configuration</h2>
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

      {/* Errors/success banner */}
      {errors.length > 0 && (
        <div className="mx-5 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-destructive">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 p-5 overflow-hidden">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          spellCheck={false}
          className="w-full h-full font-mono text-xs bg-secondary rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-ring scrollbar-thin"
        />
      </div>
    </div>
  );
}
