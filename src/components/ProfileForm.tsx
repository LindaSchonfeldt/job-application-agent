import { useState } from 'react';

import { OUTPUT_META } from '../data/OUTPUT_META';
import { type Profile } from '../types';

interface Props {
  initial?: Profile;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}

const EMPTY: Profile = {
  label: '',
  emoji: '',
  defaultOutputs: ['cv', 'coverLetter'],
  cvInstruction: '',
};

export default function ProfileForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Profile>(initial ?? EMPTY);

  const updateField = (field: keyof Profile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleOutput = (key: string) => {
    setForm((prev) => {
      const has = prev.defaultOutputs.includes(key);
      return {
        ...prev,
        defaultOutputs: has
          ? prev.defaultOutputs.filter((k) => k !== key)
          : [...prev.defaultOutputs, key],
      };
    });
  };

  const handleSave = () => {
    if (!form.label.trim()) return;
    onSave({ ...form, label: form.label.trim(), emoji: form.emoji.trim() });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Name and emoji on the same row */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Role name (e.g. Frontend Developer)"
          value={form.label}
          onChange={(e) => updateField('label', e.target.value)}
        />
        <input
          className="input w-14 text-center"
          placeholder="😊"
          value={form.emoji}
          onChange={(e) => updateField('emoji', e.target.value)}
          maxLength={2}
        />
      </div>

      {/* Default outputs */}
      <div>
        <div className="lbl">Default outputs</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(OUTPUT_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              className={`inline-flex items-center gap-[5px] px-3 py-[0.3rem] rounded-full border text-xs cursor-pointer transition-all duration-120 select-none font-sans ${
                form.defaultOutputs.includes(key)
                  ? 'bg-accent border-accent text-white'
                  : 'border-border bg-bg-secondary text-text-secondary hover:border-border-focus hover:text-text-primary'
              }`}
              onClick={() => toggleOutput(key)}
            >
              {form.defaultOutputs.includes(key) ? '✓ ' : '+ '}
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* CV instructions */}
      <div>
        <div className="lbl">Role instructions</div>
        <div className="text-[11px] text-text-muted mb-1.5">
          Should the agent exclude any of your experiences for this role? Describe the focus, tone,
          or anything the AI should keep in mind when writing your CV.
        </div>
        <textarea
          className="input"
          rows={4}
          placeholder="e.g. Exclude my service jobs. Focus on React and TypeScript. Tone should be confident and concise."
          value={form.cvInstruction}
          onChange={(e) => updateField('cvInstruction', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="btn-row">
        <button className="btn btn-p" onClick={handleSave} disabled={!form.label.trim()}>
          Save role
        </button>
        <button className="btn btn-g" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
