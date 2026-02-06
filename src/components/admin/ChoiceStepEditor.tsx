import { ChoiceStep, ChoiceOption } from "@/types/intake";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";

interface Props {
  step: ChoiceStep;
  onChange: (step: ChoiceStep) => void;
}

export function ChoiceStepEditor({ step, onChange }: Props) {
  const updateOption = (idx: number, field: keyof ChoiceOption, value: string) => {
    const options = [...step.options];
    options[idx] = { ...options[idx], [field]: value };
    onChange({ ...step, options });
  };

  const addOption = () => {
    onChange({
      ...step,
      options: [...step.options, { value: `option_${step.options.length + 1}`, label: "New Option" }],
    });
  };

  const removeOption = (idx: number) => {
    onChange({ ...step, options: step.options.filter((_, i) => i !== idx) });
  };

  const moveOption = (idx: number, dir: -1 | 1) => {
    const options = [...step.options];
    const target = idx + dir;
    if (target < 0 || target >= options.length) return;
    [options[idx], options[target]] = [options[target], options[idx]];
    onChange({ ...step, options });
  };

  return (
    <div className="space-y-3">
      {/* Options as pills */}
      <div>
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Options
        </label>
        <div className="space-y-1.5">
          {step.options.map((opt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 group/opt"
            >
              <button
                onClick={() => moveOption(idx, -1)}
                className="p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-grab"
              >
                <GripVertical className="w-3 h-3" />
              </button>
              <div className="flex-1 flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1">
                <Input
                  value={String(opt.value)}
                  onChange={(e) => updateOption(idx, "value", e.target.value)}
                  className="h-6 text-[11px] font-mono border-0 p-0 bg-transparent shadow-none focus-visible:ring-0 w-24"
                  placeholder="value"
                />
                <div className="w-px h-4 bg-border" />
                <Input
                  value={opt.label}
                  onChange={(e) => updateOption(idx, "label", e.target.value)}
                  className="h-6 text-xs border-0 p-0 bg-transparent shadow-none focus-visible:ring-0 flex-1"
                  placeholder="Label"
                />
              </div>
              <button
                onClick={() => removeOption(idx)}
                className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add option
        </button>
      </div>

      {/* save_to + action */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            save_to
          </label>
          <Input
            value={step.save_to || ""}
            onChange={(e) => onChange({ ...step, save_to: e.target.value || undefined })}
            className="h-7 text-xs font-mono"
            placeholder="field_name"
          />
        </div>
        <div className="flex-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            action
          </label>
          <Input
            value={step.action || ""}
            onChange={(e) => onChange({ ...step, action: e.target.value || undefined })}
            className="h-7 text-xs font-mono"
            placeholder="e.g. select_program"
          />
        </div>
      </div>
    </div>
  );
}
