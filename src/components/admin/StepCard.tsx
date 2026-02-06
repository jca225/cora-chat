import { IntakeStep, ChoiceStep, TextStep, ActionStep } from "@/types/intake";
import { ChoiceStepEditor } from "./ChoiceStepEditor";
import { TextStepEditor } from "./TextStepEditor";
import { ActionStepEditor } from "./ActionStepEditor";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface StepCardProps {
  step: IntakeStep;
  index: number;
  total: number;
  allStepIds: string[];
  warnings: string[];
  onChange: (step: IntakeStep) => void;
  onMove: (direction: "up" | "down") => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const KIND_COLORS: Record<string, string> = {
  choice: "bg-primary/10 text-primary border-primary/20",
  text: "bg-success/10 text-success border-success/20",
  action: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StepCard({
  step,
  index,
  total,
  allStepIds,
  warnings,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
}: StepCardProps) {
  const updateField = <K extends keyof IntakeStep>(
    key: K,
    value: IntakeStep[K]
  ) => {
    onChange({ ...step, [key]: value });
  };

  const nextOptions = allStepIds.filter((id) => id !== step.id);

  return (
    <div className="relative group rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-secondary/30 rounded-t-xl">
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 ${KIND_COLORS[step.kind]}`}
          >
            {step.kind}
          </Badge>
          <Input
            value={step.id}
            onChange={(e) => updateField("id", e.target.value)}
            className="h-7 w-40 text-xs font-mono bg-background"
            placeholder="step_id"
          />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-4 pt-3">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-[11px] text-destructive mb-1"
            >
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Prompt */}
      <div className="px-4 pt-3">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Prompt
        </label>
        <Textarea
          value={step.prompt}
          onChange={(e) => updateField("prompt", e.target.value)}
          rows={3}
          className="text-sm resize-none font-normal"
          placeholder="Enter the prompt text…"
        />
      </div>

      {/* Kind-specific editor */}
      <div className="px-4 pt-3">
        {step.kind === "choice" && (
          <ChoiceStepEditor
            step={step as ChoiceStep}
            onChange={(s) => onChange(s)}
          />
        )}
        {step.kind === "text" && (
          <TextStepEditor
            step={step as TextStep}
            onChange={(s) => onChange(s)}
          />
        )}
        {step.kind === "action" && (
          <ActionStepEditor
            step={step as ActionStep}
            onChange={(s) => onChange(s)}
          />
        )}
      </div>

      {/* Next step */}
      <div className="px-4 py-3">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Next Step
        </label>
        <Select
          value={step.next || "__none__"}
          onValueChange={(v) => updateField("next", v === "__none__" ? undefined : v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="None (end)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None (end)</SelectItem>
            {nextOptions.map((id) => (
              <SelectItem key={id} value={id}>
                {id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
