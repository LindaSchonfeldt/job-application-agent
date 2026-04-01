interface Props {
  jobTitle: string;
  loading: boolean;
  disabled: boolean;
  onDownload: () => void;
}

export default function CvBar({ jobTitle, loading, disabled, onDownload }: Props) {
  return (
    <div className="flex justify-between items-center bg-bg-secondary rounded-md px-4.5 py-3.5">
      <div>
        <div className="text-[13px] text-text-primary">CV – {jobTitle}</div>
        <div className="text-xs text-text-muted mt-0.5">Anpassat för denna tjänst · .docx</div>
      </div>
      <button
        className="bg-accent text-white text-[13px] h-9 px-4.5 rounded-md cursor-pointer font-sans font-medium border-0 inline-flex items-center gap-1.5 transition-all duration-150 hover:bg-accent-hover disabled:opacity-35 disabled:cursor-not-allowed"
        onClick={onDownload}
        disabled={disabled}
      >
        {loading ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/25 border-t-white animate-spin" />
        ) : '⬇'}
        {loading ? 'Skapar...' : 'Ladda ner'}
      </button>
    </div>
  );
}
