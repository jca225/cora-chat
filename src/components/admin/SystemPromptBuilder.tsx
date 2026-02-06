import { IntakeConfig, IntakeStep, validateIntakeConfig } from "@/types/intake";
import { StepCard } from "./StepCard";
import { AddStepModal } from "./AddStepModal";
import { FlowPreview } from "./FlowPreview";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus, AlertTriangle, Eye, EyeOff, ArrowDown } from "lucide-react";

interface Props {
  config: IntakeConfig;
  onChange: (config: IntakeConfig) => void;
}

export function SystemPromptBuilder({ config, onChange }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const validation = validateIntakeConfig(config);
  const allStepIds = config.steps.map((s) => s.id);

  const updateStep = (index: number, step: IntakeStep) => {
    const steps = [...config.steps];
    steps[index] = step;
    onChange({ ...config, steps });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const steps = [...config.steps];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= steps.length) return;
    [steps[index], steps[target]] = [steps[target], steps[index]];
    onChange({ ...config, steps });
  };

  const duplicateStep = (index: number) => {
    const original = config.steps[index];
    let newId = `${original.id}_copy`;
    let n = 1;
    while (allStepIds.includes(newId)) {
      newId = `${original.id}_copy_${n++}`;
    }
    const copy = { ...JSON.parse(JSON.stringify(original)), id: newId };
    const steps = [...config.steps];
    steps.splice(index + 1, 0, copy);
    onChange({ ...config, steps });
  };

  const deleteStep = (index: number) => {
    onChange({ ...config, steps: config.steps.filter((_, i) => i !== index) });
  };

  const addStep = (step: IntakeStep) => {
    onChange({ ...config, steps: [...config.steps, step] });
  };

  const getWarnings = (step: IntakeStep): string[] => {
    const warnings: string[] = [];
    if (validation.duplicateIds.includes(step.id)) {
      warnings.push(`Duplicate ID "${step.id}"`);
    }
    const broken = validation.brokenNextRefs.find((r) => r.stepId === step.id);
    if (broken) {
      warnings.push(`next → "${broken.next}" not found`);
    }
    return warnings;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Editor */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Config header */}
        <div className="sticky top-0 z-10 bg-card border-b px-5 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Program
              </label>
              <Input
                value={config.program}
                onChange={(e) => onChange({ ...config, program: e.target.value })}
                className="h-7 w-40 text-xs font-mono"
                placeholder="program_name"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Start Step
              </label>
              <Select
                value={config.start_step || "__none__"}
                onValueChange={(v) =>
                  onChange({ ...config, start_step: v === "__none__" ? "" : v })
                }
              >
                <SelectTrigger className="h-7 w-44 text-xs">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— none —</SelectItem>
                  {allStepIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={() => setShowPreview((p) => !p)}
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary lg:hidden"
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              Preview
            </button>
          </div>

          {/* Inline warnings */}
          {(validation.missingStartStep || validation.duplicateIds.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {validation.missingStartStep && (
                <span className="flex items-center gap-1 text-[11px] text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  start_step not found
                </span>
              )}
              {validation.duplicateIds.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  Duplicate IDs: {validation.duplicateIds.join(", ")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Steps flow */}
        <div className="p-5 space-y-0">
          {config.steps.map((step, i) => (
            <div key={`${step.id}-${i}`}>
              <StepCard
                step={step}
                index={i}
                total={config.steps.length}
                allStepIds={allStepIds}
                warnings={getWarnings(step)}
                onChange={(s) => updateStep(i, s)}
                onMove={(dir) => moveStep(i, dir)}
                onDuplicate={() => duplicateStep(i)}
                onDelete={() => deleteStep(i)}
              />
              {i < config.steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}

          {/* Add step */}
          <div className="flex justify-center pt-4 pb-8">
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Step
            </button>
          </div>
        </div>

        <AddStepModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          existingIds={allStepIds}
          onAdd={addStep}
        />
      </div>

      {/* Preview panel */}
      <div
        className={`lg:w-80 xl:w-96 border-l bg-background shrink-0 ${
          showPreview ? "block" : "hidden lg:block"
        }`}
      >
        <FlowPreview config={config} />
      </div>
    </div>
  );
}
