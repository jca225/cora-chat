export interface ChoiceOption {
  value: string | number;
  label: string;
}

export interface ChoiceStep {
  id: string;
  kind: "choice";
  prompt: string;
  options: ChoiceOption[];
  save_to?: string;
  action?: string;
  next?: string;
}

export interface TextStepInput {
  type?: "text" | "number";
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface TextStep {
  id: string;
  kind: "text";
  prompt: string;
  input?: TextStepInput;
  save_to?: string;
  next?: string;
}

export interface ActionStep {
  id: string;
  kind: "action";
  prompt: string;
  action: string;
  next?: string;
}

export type IntakeStep = ChoiceStep | TextStep | ActionStep;

export interface IntakeConfig {
  program: string;
  start_step: string;
  steps: IntakeStep[];
}

export interface IntakeValidation {
  duplicateIds: string[];
  missingStartStep: boolean;
  brokenNextRefs: { stepId: string; next: string }[];
}

export function validateIntakeConfig(config: IntakeConfig): IntakeValidation {
  const ids = config.steps.map((s) => s.id);
  const idSet = new Set<string>();
  const duplicateIds: string[] = [];
  for (const id of ids) {
    if (idSet.has(id)) duplicateIds.push(id);
    idSet.add(id);
  }

  const missingStartStep = !idSet.has(config.start_step) && config.start_step !== "";

  const brokenNextRefs: { stepId: string; next: string }[] = [];
  for (const step of config.steps) {
    if (step.next && !idSet.has(step.next)) {
      brokenNextRefs.push({ stepId: step.id, next: step.next });
    }
  }

  return { duplicateIds, missingStartStep, brokenNextRefs };
}
