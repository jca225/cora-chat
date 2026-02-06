import { useState, useCallback } from "react";
import { IntakeConfig, IntakeStep } from "@/types/intake";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface Props {
  config: IntakeConfig;
}

export function FlowPreview({ config }: Props) {
  const [currentStepId, setCurrentStepId] = useState(config.start_step);
  const [textValue, setTextValue] = useState("");
  const [history, setHistory] = useState<{ stepId: string; answer?: string }[]>([]);

  const reset = useCallback(() => {
    setCurrentStepId(config.start_step);
    setTextValue("");
    setHistory([]);
  }, [config.start_step]);

  const currentStep = config.steps.find((s) => s.id === currentStepId);

  const advance = (step: IntakeStep, answer?: string) => {
    setHistory((h) => [...h, { stepId: step.id, answer }]);
    if (step.next) {
      setCurrentStepId(step.next);
      setTextValue("");
    } else {
      setCurrentStepId("__done__");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Preview
        </span>
        <button
          onClick={reset}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {/* History */}
        {history.map((h, i) => {
          const step = config.steps.find((s) => s.id === h.stepId);
          if (!step) return null;
          return (
            <div key={i} className="space-y-1.5">
              <div className="bg-secondary/60 rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap">
                {step.prompt}
              </div>
              {h.answer && (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-xl px-3.5 py-2 text-sm max-w-[80%]">
                    {h.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Current step */}
        {currentStepId === "__done__" ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Flow complete ✓</p>
            <Button variant="ghost" size="sm" onClick={reset} className="mt-2">
              Restart
            </Button>
          </div>
        ) : currentStep ? (
          <div className="space-y-3">
            <div className="bg-secondary/60 rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap">
              {currentStep.prompt}
            </div>

            {currentStep.kind === "choice" && (
              <div className="flex flex-wrap gap-1.5">
                {currentStep.options.map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => advance(currentStep, opt.label)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentStep.kind === "text" && (
              <div className="flex gap-2">
                <Input
                  type={currentStep.input?.type || "text"}
                  min={currentStep.input?.min}
                  max={currentStep.input?.max}
                  placeholder={currentStep.input?.placeholder || "Type…"}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="h-8 text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && textValue.trim()) {
                      advance(currentStep, textValue);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    if (textValue.trim()) advance(currentStep, textValue);
                  }}
                >
                  Continue
                </Button>
              </div>
            )}

            {currentStep.kind === "action" && (
              <Button
                size="sm"
                onClick={() => advance(currentStep)}
              >
                Continue
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-destructive">
              Step "{currentStepId}" not found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
