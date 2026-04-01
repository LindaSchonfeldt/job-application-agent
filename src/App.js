import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { DocxBuilder } from './builders/DocxBuilder';
import { SystemPromptBuilder } from './builders/SystemPromptBuilder';
import { OUTPUT_META } from './data/OUTPUT_META';
import { PROFILES } from './data/PROFILES';
import { USER } from './data/USER';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claude_api_key') ?? '');
  // Save the API key to state and localStorage for persistence
  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('claude_api_key', key);
  };
  const [profile, setProfile] = useState('service');
  const [jobListing, setJobListing] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKw] = useState(new Set());
  const [newKeyword, setNewKw] = useState('');
  const [docxReady, setDocxReady] = useState(false);
  const [selectedOutputs, setSelectedOutputs] = useState(
    new Set(PROFILES['service']?.defaultOutputs ?? []),
  );
  useEffect(() => {
    if (window.docx) {
      setDocxReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/docx@8.5.0/build/index.js';
    s.onload = () => setDocxReady(true);
    document.head.appendChild(s);
  }, []);
  // Switch to a different profile and reset related state
  const switchProfile = (key) => {
    setProfile(key);
    setSelectedOutputs(new Set(PROFILES[key]?.defaultOutputs ?? []));
    setResult(null);
    setError(null);
  };
  // Toggle the inclusion of a specific output in the generated results
  const toggleOutput = (key) => {
    setSelectedOutputs((prev) => {
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
          ?.map((b) => b.text || '')
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
  const toggleKeyword = (kw) =>
    setSelectedKw((prev) => {
      const n = new Set(prev);
      n.has(kw) ? n.delete(kw) : n.add(kw);
      return n;
    });
  // Add a new keyword to the list and select it
  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw) return;
    if (!keywords.includes(kw)) setKeywords((prev) => [...prev, kw]);
    setSelectedKw((prev) => new Set([...prev, kw]));
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
        ?.map((b) => b.text || '')
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
  const copy = async (key, text) => {
    await navigator.clipboard.writeText(text);
    setCopied((p) => ({ ...p, [key]: true }));
    setTimeout(() => setCopied((p) => ({ ...p, [key]: false })), 2000);
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
  return _jsx(_Fragment, {
    children: _jsxs('div', {
      className: 'app',
      children: [
        _jsxs('div', {
          className: 'header',
          children: [
            _jsx('div', { className: 'hi', children: 'LS' }),
            _jsxs('div', {
              children: [
                _jsx('div', { className: 'hn', children: 'Ans\u00F6kningsagent' }),
                _jsx('div', { className: 'hs', children: USER.name }),
              ],
            }),
            _jsx('input', {
              className: 'api-key-input',
              type: 'password',
              value: apiKey,
              onChange: (e) => saveApiKey(e.target.value),
              placeholder: 'Anthropic API-nyckel...',
            }),
          ],
        }),
        _jsxs('div', {
          className: 'main',
          children: [
            _jsxs('div', {
              className: 'card',
              children: [
                _jsx('div', { className: 'lbl', children: 'Profil' }),
                _jsx('div', {
                  className: 'profiles',
                  children: Object.entries(PROFILES).map(([key, p]) =>
                    _jsxs(
                      'button',
                      {
                        className: `pb${profile === key ? ' active' : ''}`,
                        onClick: () => switchProfile(key),
                        children: [
                          _jsx('span', { style: { fontSize: 15 }, children: p.emoji }),
                          p.label,
                        ],
                      },
                      key,
                    ),
                  ),
                }),
              ],
            }),
            _jsxs('div', {
              className: 'card',
              children: [
                _jsx('div', { className: 'lbl', children: 'Jobbannons' }),
                _jsx('textarea', {
                  value: jobListing,
                  onChange: (e) => setJobListing(e.target.value),
                  placeholder: 'Klistra in hela jobbannonsen h\u00E4r...',
                }),
                jobListing.trim() &&
                  _jsxs(_Fragment, {
                    children: [
                      _jsx('div', { className: 'divider' }),
                      _jsxs('div', {
                        children: [
                          _jsxs('div', {
                            className: 'kw-top',
                            children: [
                              _jsx('div', {
                                className: 'lbl',
                                style: { margin: 0 },
                                children: 'Nyckelord',
                              }),
                              _jsxs('div', {
                                style: {
                                  display: 'flex',
                                  gap: '0.5rem',
                                  alignItems: 'center',
                                },
                                children: [
                                  keywords.length > 0 &&
                                    _jsxs('span', {
                                      className: 'kw-count',
                                      children: [
                                        _jsx('b', { children: selectedKeywords.size }),
                                        ' av ',
                                        keywords.length,
                                      ],
                                    }),
                                  _jsxs('button', {
                                    className: 'btn btn-g',
                                    onClick: extractKeywords,
                                    disabled: loadingKeywords || !apiKey,
                                    children: [
                                      loadingKeywords
                                        ? _jsx('div', { className: 'spinner-sm' })
                                        : null,
                                      loadingKeywords
                                        ? 'Hämtar...'
                                        : keywords.length > 0
                                          ? 'Uppdatera'
                                          : 'Hämta nyckelord',
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          keywords.length > 0 &&
                            _jsx('div', {
                              className: 'tags',
                              children: keywords.map((kw) =>
                                _jsxs(
                                  'button',
                                  {
                                    className: `tag${selectedKeywords.has(kw) ? ' on' : ''}`,
                                    onClick: () => toggleKeyword(kw),
                                    children: [
                                      selectedKeywords.has(kw) &&
                                        _jsx('span', {
                                          style: { fontSize: 10 },
                                          children: '\u2713 ',
                                        }),
                                      kw,
                                    ],
                                  },
                                  kw,
                                ),
                              ),
                            }),
                          _jsxs('div', {
                            className: 'add-row',
                            children: [
                              _jsx('input', {
                                className: 'add-input',
                                value: newKeyword,
                                onChange: (e) => setNewKw(e.target.value),
                                placeholder: 'L\u00E4gg till eget nyckelord...',
                                onKeyDown: (e) => e.key === 'Enter' && addKeyword(),
                              }),
                              _jsx('button', {
                                className: 'add-btn',
                                onClick: addKeyword,
                                disabled: !newKeyword.trim(),
                                children: 'L\u00E4gg till',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                _jsx('div', { className: 'divider' }),
                _jsx('div', { className: 'lbl', children: 'Vad ska genereras' }),
                _jsx('div', {
                  className: 'outputs-grid',
                  children: Object.entries(OUTPUT_META).map(([key, meta]) =>
                    _jsxs(
                      'button',
                      {
                        className: `out-toggle${selectedOutputs.has(key) ? ' on' : ''}`,
                        onClick: () => toggleOutput(key),
                        children: [selectedOutputs.has(key) ? '✓ ' : '+ ', meta.label],
                      },
                      key,
                    ),
                  ),
                }),
                _jsxs('div', {
                  className: 'btn-row',
                  children: [
                    _jsxs('button', {
                      className: 'btn btn-p',
                      onClick: generate,
                      disabled: loading || !jobListing.trim(),
                      children: [
                        loading ? _jsx('div', { className: 'spinner' }) : null,
                        loading ? 'Genererar...' : 'Generera ↗',
                      ],
                    }),
                    (jobListing || result) &&
                      !loading &&
                      _jsx('button', { className: 'btn btn-g', onClick: reset, children: 'Rensa' }),
                  ],
                }),
              ],
            }),
            error && _jsx('div', { className: 'err', children: error }),
            result &&
              _jsxs('div', {
                className: 'card results',
                children: [
                  selectedOutputs.has('cv') &&
                    result.cv &&
                    _jsxs('div', {
                      className: 'cv-bar',
                      children: [
                        _jsxs('div', {
                          children: [
                            _jsxs('div', {
                              className: 'cv-info',
                              children: ['CV \u2013 ', result.cv.jobTitle || USER.name],
                            }),
                            _jsx('div', {
                              className: 'cv-sub',
                              children: 'Anpassat f\u00F6r denna tj\u00E4nst \u00B7 .docx',
                            }),
                          ],
                        }),
                        _jsxs('button', {
                          className: 'btn-dl',
                          onClick: downloadCv,
                          disabled: loadingDownload || !docxReady,
                          children: [
                            loadingDownload ? _jsx('div', { className: 'spinner-dl' }) : '⬇',
                            loadingDownload ? 'Skapar...' : 'Ladda ner',
                          ],
                        }),
                      ],
                    }),
                  textOutputKeys.map((key) =>
                    result[key]
                      ? _jsxs(
                          'div',
                          {
                            className: 'rb',
                            children: [
                              _jsxs('div', {
                                className: 'rh',
                                children: [
                                  _jsx('span', {
                                    className: 'rt',
                                    children: OUTPUT_META[key].label,
                                  }),
                                  _jsx('button', {
                                    className: 'btn-c',
                                    onClick: () => copy(key, result[key]),
                                    children: copied[key]
                                      ? _jsx('span', {
                                          className: 'cl',
                                          children: 'Kopierat \u2713',
                                        })
                                      : 'Kopiera',
                                  }),
                                ],
                              }),
                              _jsx('div', { className: 'rv', children: result[key] }),
                            ],
                          },
                          key,
                        )
                      : null,
                  ),
                ],
              }),
            !result &&
              !loading &&
              !error &&
              _jsx('div', {
                className: 'empty',
                children: 'V\u00E4lj profil, klistra in annons och tryck p\u00E5 generera',
              }),
          ],
        }),
      ],
    }),
  });
}
//# sourceMappingURL=App.js.map
