import React from 'react'

interface Props {
  text: string
  onChange: (text: string) => void
  label: string
  copied: boolean
  onCopy: () => void
}

export function CoverLetterEditor({ text, onChange, label, copied, onCopy }: Props) {
  return (
    <div className='rb'>
      <div className='rh'>
        <span className='rt'>{label}</span>
        <button className='btn-c' onClick={onCopy}>
          {copied ? <span className='cl'>Kopierat ✓</span> : 'Kopiera'}
        </button>
      </div>
      <textarea
        className='cle-ta'
        value={text}
        onChange={e => onChange(e.target.value)}
        rows={12}
      />
    </div>
  )
}
