import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function CoverLetterEditor({ text, onChange, label, copied, onCopy }) {
    return (_jsxs("div", { className: 'rb', children: [_jsxs("div", { className: 'rh', children: [_jsx("span", { className: 'rt', children: label }), _jsx("button", { className: 'btn-c', onClick: onCopy, children: copied ? _jsx("span", { className: 'cl', children: "Kopierat \u2713" }) : 'Kopiera' })] }), _jsx("textarea", { className: 'cle-ta', value: text, onChange: e => onChange(e.target.value), rows: 12 })] }));
}
//# sourceMappingURL=CoverLetterEditor.js.map