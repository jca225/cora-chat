import { ActionStep } from "@/types/intake";
import { Input } from "@/components/ui/input";

interface Props {
  step: ActionStep;
  onChange: (step: ActionStep) => void;
}

export function ActionStepEditor({ step, onChange }: Props) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
        Action (required)
      </label>
      <Input
        value={step.action}
        onChange={(e) => onChange({ ...step, action: e.target.value })}
        className="h-7 text-xs font-mono"
        placeholder="e.g. start_therapy"
      />
    </div>
  );
}
