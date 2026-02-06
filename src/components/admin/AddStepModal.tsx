import { useState } from "react";
import { IntakeStep } from "@/types/intake";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  existingIds: string[];
  onAdd: (step: IntakeStep) => void;
}

export function AddStepModal({ open, onClose, existingIds, onAdd }: Props) {
  const [kind, setKind] = useState<"choice" | "text" | "action">("choice");
  const [id, setId] = useState("");

  const suggestId = (k: string) => {
    let base = `${k}_step`;
    let n = 1;
    while (existingIds.includes(`${base}_${n}`)) n++;
    return `${base}_${n}`;
  };

  const handleKindChange = (k: "choice" | "text" | "action") => {
    setKind(k);
    if (!id || id.startsWith("choice_step") || id.startsWith("text_step") || id.startsWith("action_step")) {
      setId(suggestId(k));
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setId(suggestId(kind));
    } else {
      onClose();
    }
  };

  const handleAdd = () => {
    const finalId = id.trim() || suggestId(kind);
    let step: IntakeStep;
    switch (kind) {
      case "choice":
        step = {
          id: finalId,
          kind: "choice",
          prompt: "Your question here",
          options: [{ value: "option_1", label: "Option 1" }],
        };
        break;
      case "text":
        step = {
          id: finalId,
          kind: "text",
          prompt: "Your question here",
          input: { type: "text", placeholder: "" },
        };
        break;
      case "action":
        step = {
          id: finalId,
          kind: "action",
          prompt: "Processing…",
          action: "start_therapy",
        };
        break;
    }
    onAdd(step);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add Step</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Step Kind
            </label>
            <Select value={kind} onValueChange={(v) => handleKindChange(v as any)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="choice">Choice</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="action">Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Step ID
            </label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="h-9 text-sm font-mono"
              placeholder="unique_step_id"
            />
            {existingIds.includes(id) && (
              <p className="text-[11px] text-destructive mt-1">
                This ID already exists
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!id.trim() || existingIds.includes(id)}
          >
            Add Step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
