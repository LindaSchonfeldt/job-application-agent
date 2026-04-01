interface Props {
  label: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}

export default function ResultCard({ label, text, copied, onCopy }: Props) {
  return (
    <div className="bg-bg-secondary rounded-md p-4.5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-text-muted">
          {label}
        </span>
        <button
          className="bg-transparent text-text-muted border border-border text-xs h-7 px-3 rounded-md cursor-pointer font-sans transition-all duration-120 hover:text-text-primary hover:border-border-strong"
          onClick={onCopy}
        >
          {copied ? <span className="text-xs text-text-success font-medium">Kopierat ✓</span> : 'Kopiera'}
        </button>
      </div>
      <div className="text-sm leading-[1.8] text-text-primary whitespace-pre-wrap">{text}</div>
    </div>
  );
}
