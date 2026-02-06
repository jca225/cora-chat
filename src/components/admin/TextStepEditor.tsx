import { TextStep } from "@/types/intake";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  step: TextStep;
  onChange: (step: TextStep) => void;
}

export function TextStepEditor({ step, onChange }: Props) {
  const inputType = step.input?.type || "text";

  const updateInput = (fields: Partial<TextStep["input"]>) => {
    onChange({
      ...step,
      input: { ...step.input, ...fields },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-32">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            Input type
          </label>
          <Select
            value={inputType}
            onValueChange={(v) => updateInput({ type: v as "text" | "number" })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            Placeholder
          </label>
          <Input
            value={step.input?.placeholder || ""}
            onChange={(e) => updateInput({ placeholder: e.target.value || undefined })}
            className="h-7 text-xs"
            placeholder="Enter placeholder…"
          />
        </div>
      </div>

      {inputType === "number" && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
              Min
            </label>
            <Input
              type="number"
              value={step.input?.min ?? ""}
              onChange={(e) =>
                updateInput({
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
              Max
            </label>
            <Input
              type="number"
              value={step.input?.max ?? ""}
              onChange={(e) =>
                updateInput({
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}

      <div className="w-48">
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
    </div>
  );
}
