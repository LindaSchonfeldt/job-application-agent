import { OUTPUT_META } from '../data/OUTPUT_META';

interface Props {
  selectedOutputs: Set<string>;
  onToggle: (key: string) => void;
}

export default function OutputSelector({ selectedOutputs, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(OUTPUT_META).map(([key, meta]) => (
        <button
          key={key}
          className={`inline-flex items-center gap-[5px] px-3 py-[0.3rem] rounded-full border text-xs cursor-pointer transition-all duration-120 select-none font-sans ${
            selectedOutputs.has(key)
              ? 'bg-accent border-accent text-white'
              : 'border-border bg-bg-secondary text-text-secondary hover:border-border-focus hover:text-text-primary'
          }`}
          onClick={() => onToggle(key)}
        >
          {selectedOutputs.has(key) ? '✓ ' : '+ '}
          {meta.label}
        </button>
      ))}
    </div>
  );
}
