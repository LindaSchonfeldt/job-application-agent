interface Props {
  name: string;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function Header({ name, apiKey, onApiKeyChange }: Props) {
  return (
    <div className="bg-accent px-8 py-5 flex items-center gap-3.5">
      <div className="w-8.5 h-8.5 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/85 shrink-0">
        {getInitials(name)}
      </div>
      <div>
        <div className="text-white/90 text-sm font-medium">Ansökningsagent</div>
        <div className="text-white/40 text-xs mt-px">{name}</div>
      </div>
      <input
        className="ml-auto font-sans text-xs text-white/70 bg-white/10 border border-white/20 rounded-md px-3 h-8 outline-none w-52 transition-colors duration-150 focus:border-white/50 placeholder:text-white/30"
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="Anthropic API-nyckel..."
      />
    </div>
  );
}
