interface Props {
  keywords: string[];
  selectedKeywords: Set<string>;
  newKeyword: string;
  loading: boolean;
  hasApiKey: boolean;
  onExtract: () => void;
  onToggle: (kw: string) => void;
  onNewKeywordChange: (value: string) => void;
  onAdd: () => void;
}

export default function KeywordsSection({
  keywords,
  selectedKeywords,
  newKeyword,
  loading,
  hasApiKey,
  onExtract,
  onToggle,
  onNewKeywordChange,
  onAdd,
}: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="lbl" style={{ margin: 0 }}>
          Nyckelord
        </div>
        <div className="flex gap-2 items-center">
          {keywords.length > 0 && (
            <span className="text-xs text-text-muted">
              <b className="text-text-primary font-medium">{selectedKeywords.size}</b>{' '}
              av {keywords.length}
            </span>
          )}
          <button
            className="btn btn-g"
            onClick={onExtract}
            disabled={loading || !hasApiKey}
          >
            {loading && (
              <div className="w-3 h-3 rounded-full border-[1.5px] border-accent/15 border-t-accent animate-spin" />
            )}
            {loading ? 'Hämtar...' : keywords.length > 0 ? 'Uppdatera' : 'Hämta nyckelord'}
          </button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {keywords.map((kw) => (
            <button
              key={kw}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-bg-secondary text-xs cursor-pointer transition-all duration-120 select-none font-sans ${
                selectedKeywords.has(kw)
                  ? 'bg-accent border-accent text-white'
                  : 'border-border text-text-secondary hover:border-border-focus hover:text-text-primary'
              }`}
              onClick={() => onToggle(kw)}
            >
              {selectedKeywords.has(kw) && <span style={{ fontSize: 10 }}>✓ </span>}
              {kw}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 font-sans text-[13px] text-text-primary bg-bg-secondary border border-border rounded-md px-3 outline-none h-8 transition-colors duration-150 focus:border-border-focus placeholder:text-text-muted"
          value={newKeyword}
          onChange={(e) => onNewKeywordChange(e.target.value)}
          placeholder="Lägg till eget nyckelord..."
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <button
          className="h-8 px-3.5 text-xs bg-transparent border border-border-strong text-text-secondary rounded-md cursor-pointer font-sans transition-all duration-120 hover:bg-bg-secondary disabled:opacity-35 disabled:cursor-not-allowed"
          onClick={onAdd}
          disabled={!newKeyword.trim()}
        >
          Lägg till
        </button>
      </div>
    </div>
  );
}
