import { useEffect, useState } from 'react';

import { DocxBuilder } from './builders/DocxBuilder';
import CvBar from './components/CvBar';
import Header from './components/Header';
import KeywordsSection from './components/KeywordsSection';
import OutputSelector from './components/OutputSelector';
import ResultCard from './components/ResultCard';
import { SystemPromptBuilder } from './builders/SystemPromptBuilder';
import { OUTPUT_META } from './data/OUTPUT_META';
import { PROFILES } from './data/PROFILES';
import { USER } from './data/USER';


function detectLanguage(text: string): 'sv' | 'en' {
  const words = text.toLowerCase().match(/\b\w+\b/g) ?? [];
  if (words.length === 0) return 'sv';
  const svWords = new Set([
    'och',
    'att',
    'för',
    'med',
    'av',
    'en',
    'ett',
    'är',
    'som',
    'på',
    'vi',
    'du',
    'det',
    'den',
    'sin',
    'sig',
    'till',
    'om',
    'men',
    'har',
    'kan',
    'ska',
    'eller',
    'inte',
    'också',
    'vill',
    'inom',
    'samt',
    'vara',
    'våra',
    'vårt',
    'hos',
  ]);
  const svCount = words.filter((w) => svWords.has(w)).length;
  return svCount / words.length > 0.04 ? 'sv' : 'en';
}

// Example types, adjust as needed for your actual data

interface CvData {
  jobTitle: string;
  about: string;
  experiences: any[];
  includeMind: boolean;
  skills: string;
}

interface Result {
  cv?: CvData;
  [key: string]: any;
}

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('claude_api_key') ?? '');

  // Save the API key to state and localStorage for persistence
  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('claude_api_key', key);
  };

  const [profile, setProfile] = useState<string>('service');
  const [jobListing, setJobListing] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingKeywords, setLoadingKeywords] = useState<boolean>(false);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKw] = useState<Set<string>>(new Set());
  const [newKeyword, setNewKw] = useState<string>('');
  const [docxReady, setDocxReady] = useState<boolean>(false);
  const [selectedOutputs, setSelectedOutputs] = useState<Set<string>>(
    new Set(PROFILES['service']?.defaultOutputs ?? []),
  );

  useEffect(() => {
    if ((window as any).docx) {
      setDocxReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/docx@8.5.0/build/index.js';
    s.onload = () => setDocxReady(true);
    document.head.appendChild(s);
  }, []);

  // Switch to a different profile and reset related state
  const switchProfile = (key: string) => {
    setProfile(key);
    setSelectedOutputs(new Set(PROFILES[key]?.defaultOutputs ?? []));
    setResult(null);
    setError(null);
  };

  // Toggle the inclusion of a specific output in the generated results
  const toggleOutput = (key: string) => {
    setSelectedOutputs((prev: Set<string>) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  // Extract keywords from the job listing using the API and update state
  const extractKeywords = async () => {
    if (!jobListing.trim()) return;
    setLoadingKeywords(true);
    try {
      const lang = detectLanguage(jobListing);
      const kwSystemPrompt =
        lang === 'en'
          ? `Extract the most important keywords and skills from a job listing. Return ONLY a JSON array of 8–14 short phrases (max 4 words each), in English. No markdown characters.`
          : `Extrahera de viktigaste nyckelorden och kompetenserna från en jobbannons. Returnera ENDAST en JSON-array med 8–14 korta fraser (max 4 ord), på svenska. Inga markdown-tecken.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: kwSystemPrompt,
          messages: [{ role: 'user', content: jobListing }],
        }),
      });
      const data = await res.json();
      const parsed = JSON.parse(
        data.content
          ?.map((b: any) => b.text || '')
          .join('')
          .trim()
          .replace(/```json|```/g, '')
          .trim(),
      );
      setKeywords(parsed);
      setSelectedKw(new Set(parsed));
    } catch {
    } finally {
      setLoadingKeywords(false);
    }
  };

  // Update a specific field in the CV data and trigger onChange with the new CV
  const toggleKeyword = (kw: string) =>
    setSelectedKw((prev: Set<string>) => {
      const n = new Set(prev);
      n.has(kw) ? n.delete(kw) : n.add(kw);
      return n;
    });

  // Add a new keyword to the list and select it
  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw) return;
    if (!keywords.includes(kw)) setKeywords((prev: string[]) => [...prev, kw]);
    setSelectedKw((prev: Set<string>) => new Set([...prev, kw]));
    setNewKw('');
  };

  // Generate the CV and other outputs based on the job listing and selected profile
  const generate = async () => {
    if (!jobListing.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const lang = detectLanguage(jobListing);
      const system = new SystemPromptBuilder(
        profile,
        selectedKeywords,
        selectedOutputs,
        lang,
      ).build();
      const userPrefix = lang === 'en' ? 'Job listing:' : 'Jobbannonsen:';
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1800,
          system,
          messages: [{ role: 'user', content: `${userPrefix}\n\n${jobListing}` }],
        }),
      });
      const data = await res.json();
      const text = data.content
        ?.map((b: any) => b.text || '')
        .join('')
        .trim();
      setResult(JSON.parse(text.replace(/```json|```/g, '').trim()));
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  // Update a specific field in the CV data and trigger onChange with the new CV
  const downloadCv = async () => {
    if (!result?.cv || !docxReady) return;
    setLoadingDownload(true);
    try {
      const blob = await new DocxBuilder(result.cv).build();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${USER.name.replace(/\s+/g, '.')}_CV.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Kunde inte generera CV-filen. Försök igen.');
    } finally {
      setLoadingDownload(false);
    }
  };

  // Utility function to copy text to clipboard and show "Copied" feedback
  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied((p: { [key: string]: boolean }) => ({ ...p, [key]: true }));
    setTimeout(() => setCopied((p: { [key: string]: boolean }) => ({ ...p, [key]: false })), 2000);
  };

  // Reset all inputs and outputs to start a new generation
  const reset = () => {
    setJobListing('');
    setResult(null);
    setError(null);
    setKeywords([]);
    setSelectedKw(new Set());
  };

  const textOutputKeys = ['about', 'email', 'linkedin', 'coverLetter'].filter((k) =>
    selectedOutputs.has(k),
  );

  return (
    <>
      <div className="app">
        <Header
          name={USER.name}
          apiKey={apiKey}
          onApiKeyChange={saveApiKey}
        />
        <div className="main">
          <div className="card">
            <div className="lbl">Profil</div>
            <div className="profiles">
              {Object.entries(PROFILES).map(([key, p]) => (
                <button
                  key={key}
                  className={`pb${profile === key ? ' active' : ''}`}
                  onClick={() => switchProfile(key)}
                >
                  <span style={{ fontSize: 15 }}>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="lbl">Jobbannons</div>
            <textarea
              value={jobListing}
              onChange={(e) => setJobListing(e.target.value)}
              placeholder="Klistra in hela jobbannonsen här..."
            />

            {jobListing.trim() && (
              <>
                <div className="divider" />
                <KeywordsSection
                  keywords={keywords}
                  selectedKeywords={selectedKeywords}
                  newKeyword={newKeyword}
                  loading={loadingKeywords}
                  hasApiKey={!!apiKey}
                  onExtract={extractKeywords}
                  onToggle={toggleKeyword}
                  onNewKeywordChange={setNewKw}
                  onAdd={addKeyword}
                />
              </>
            )}

            <div className="divider" />
            <div className="lbl">Vad ska genereras</div>
            <OutputSelector
              selectedOutputs={selectedOutputs}
              onToggle={toggleOutput}
            />

            <div className="btn-row">
              <button
                className="btn btn-p"
                onClick={generate}
                disabled={loading || !jobListing.trim()}
              >
                {loading ? <div className="spinner" /> : null}
                {loading ? 'Genererar...' : 'Generera ↗'}
              </button>
              {(jobListing || result) && !loading && (
                <button className="btn btn-g" onClick={reset}>
                  Rensa
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-bg-danger border border-border-danger rounded-md px-4 py-3.5 text-[13px] text-text-danger">
              {error}
            </div>
          )}

          {result && (
            <div className="card results">
              {selectedOutputs.has('cv') && result.cv && (
                <CvBar
                  jobTitle={result.cv.jobTitle || USER.name}
                  loading={loadingDownload}
                  disabled={loadingDownload || !docxReady}
                  onDownload={downloadCv}
                />
              )}
              {textOutputKeys.map((key) =>
                result[key] ? (
                  <ResultCard
                    key={key}
                    label={OUTPUT_META[key as keyof typeof OUTPUT_META].label}
                    text={result[key]}
                    copied={copied[key] ?? false}
                    onCopy={() => copy(key, result[key])}
                  />
                ) : null,
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center py-6 text-text-muted text-[13px]">Välj profil, klistra in annons och tryck på generera</div>
          )}
        </div>
      </div>
    </>
  );
}
