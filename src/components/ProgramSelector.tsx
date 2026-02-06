import { ChoicePayload } from "@/types/chat";

interface Props {
  payload: ChoicePayload;
  onSelect: (selectedText: string) => void;
  disabled?: boolean;
}

export function ProgramSelector({ payload, onSelect, disabled }: Props) {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-chat-assistant text-chat-assistant-foreground px-4 py-3">
        <p className="text-sm mb-3 whitespace-pre-wrap">{payload.reply}</p>
        <div className="flex flex-wrap gap-2">
          {payload.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.label?.trim() || opt.value)}
              disabled={disabled}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
