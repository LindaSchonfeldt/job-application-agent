import type { CvData } from '../builders/DocxBuilder';
import { ALL_EXPERIENCES } from '../data/ALL_EXPERIENCES';
import { USER } from '../data/USER';

interface Props {
  cv: CvData;
  onChange: (cv: CvData) => void;
  onDownload: () => void;
  loadingDownload: boolean;
  docxReady: boolean;
}

export function CVPreview({ cv, onChange, onDownload, loadingDownload, docxReady }: Props) {
  const set = <K extends keyof CvData>(key: K, value: CvData[K]) =>
    onChange({ ...cv, [key]: value });

  const updateBullet = (expIdx: number, bulletIdx: number, value: string) =>
    onChange({
      ...cv,
      experiences: cv.experiences.map((e, i) =>
        i === expIdx
          ? {
              ...e,
              bullets: (e.bullets as string[]).map((b, bi) => (bi === bulletIdx ? value : b)),
            }
          : e,
      ),
    });

  const updateTitle = (expIdx: number, value: string) =>
    onChange({
      ...cv,
      experiences: cv.experiences.map((e, i) =>
        i === expIdx ? { ...e, titleOverride: value || undefined } : e,
      ),
    });

  return (
    <div className="cvp">
      <div className="cvp-head">
        <div className="cvp-name">{USER.name}</div>
        <input
          className="cvp-title-input"
          value={cv.jobTitle}
          onChange={(e) => set('jobTitle', e.target.value)}
          placeholder="Jobbtitel..."
        />
        <div className="cvp-contact">{USER.contact}</div>
      </div>

      <div className="cvp-section">
        <div className="cvp-sh">Om mig</div>
        <textarea
          className="cvp-ta"
          value={cv.about}
          onChange={(e) => set('about', e.target.value)}
          rows={3}
        />
      </div>

      <div className="cvp-section">
        <div className="cvp-sh">Arbetslivserfarenhet</div>
        {cv.experiences.map((exp, i) => {
          const base = ALL_EXPERIENCES[exp.key as keyof typeof ALL_EXPERIENCES];
          if (!base) return null;
          return (
            <div key={exp.key} className="cvp-exp">
              <div className="cvp-exp-meta">
                <input
                  className="cvp-exp-title"
                  value={exp.titleOverride ?? base.title}
                  onChange={(e) => updateTitle(i, e.target.value)}
                />
                <span className="cvp-exp-sub">
                  {base.employer} · {base.period}
                </span>
              </div>
              {(exp.bullets as string[]).map((bullet, bi) => (
                <div key={bi} className="cvp-bullet">
                  <span className="cvp-dot">•</span>
                  <input
                    className="cvp-bullet-input"
                    value={bullet}
                    onChange={(e) => updateBullet(i, bi, e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {Object.values(ALL_EXPERIENCES).some((e) => e.type === 'volunteer') && (
        <div className="cvp-section">
          <label className="cvp-mind">
            <input
              type="checkbox"
              checked={cv.includeMind}
              onChange={(e) => set('includeMind', e.target.checked)}
            />
            <span>
              Inkludera övrig erfarenhet (
              {Object.values(ALL_EXPERIENCES)
                .filter((e) => e.type === 'volunteer')
                .map((e) => e.employer)
                .join(', ')}
              )
            </span>
          </label>
        </div>
      )}

      <div className="cvp-section">
        <div className="cvp-sh">Utbildning</div>
        {USER.education.map((u, i) => (
          <div key={i} className="cvp-edu">
            {u.name} · {u.period}
          </div>
        ))}
      </div>

      <div className="cvp-section">
        <div className="cvp-sh">Kunskaper & övrigt</div>
        <textarea
          className="cvp-ta"
          value={cv.skills}
          onChange={(e) => set('skills', e.target.value)}
          rows={2}
        />
      </div>

      <div className="cvp-footer">
        <button className="btn-dl" onClick={onDownload} disabled={loadingDownload || !docxReady}>
          {loadingDownload ? <div className="spinner-dl" /> : '⬇'}
          {loadingDownload ? 'Skapar...' : 'Ladda ner .docx'}
        </button>
      </div>
    </div>
  );
}
