import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ALL_EXPERIENCES } from '../data/ALL_EXPERIENCES';
import { USER } from '../data/USER';
export function CVPreview({ cv, onChange, onDownload, loadingDownload, docxReady }) {
    const set = (key, value) => onChange({ ...cv, [key]: value });
    const updateBullet = (expIdx, bulletIdx, value) => onChange({
        ...cv,
        experiences: cv.experiences.map((e, i) => i === expIdx
            ? {
                ...e,
                bullets: e.bullets.map((b, bi) => (bi === bulletIdx ? value : b)),
            }
            : e),
    });
    const updateTitle = (expIdx, value) => onChange({
        ...cv,
        experiences: cv.experiences.map((e, i) => i === expIdx ? { ...e, titleOverride: value || undefined } : e),
    });
    return (_jsxs("div", { className: "cvp", children: [_jsxs("div", { className: "cvp-head", children: [_jsx("div", { className: "cvp-name", children: USER.name }), _jsx("input", { className: "cvp-title-input", value: cv.jobTitle, onChange: (e) => set('jobTitle', e.target.value), placeholder: "Jobbtitel..." }), _jsx("div", { className: "cvp-contact", children: USER.contact })] }), _jsxs("div", { className: "cvp-section", children: [_jsx("div", { className: "cvp-sh", children: "Om mig" }), _jsx("textarea", { className: "cvp-ta", value: cv.about, onChange: (e) => set('about', e.target.value), rows: 3 })] }), _jsxs("div", { className: "cvp-section", children: [_jsx("div", { className: "cvp-sh", children: "Arbetslivserfarenhet" }), cv.experiences.map((exp, i) => {
                        const base = ALL_EXPERIENCES[exp.key];
                        if (!base)
                            return null;
                        return (_jsxs("div", { className: "cvp-exp", children: [_jsxs("div", { className: "cvp-exp-meta", children: [_jsx("input", { className: "cvp-exp-title", value: exp.titleOverride ?? base.title, onChange: (e) => updateTitle(i, e.target.value) }), _jsxs("span", { className: "cvp-exp-sub", children: [base.employer, " \u00B7 ", base.period] })] }), exp.bullets.map((bullet, bi) => (_jsxs("div", { className: "cvp-bullet", children: [_jsx("span", { className: "cvp-dot", children: "\u2022" }), _jsx("input", { className: "cvp-bullet-input", value: bullet, onChange: (e) => updateBullet(i, bi, e.target.value) })] }, bi)))] }, exp.key));
                    })] }), Object.values(ALL_EXPERIENCES).some((e) => e.type === 'volunteer') && (_jsx("div", { className: "cvp-section", children: _jsxs("label", { className: "cvp-mind", children: [_jsx("input", { type: "checkbox", checked: cv.includeMind, onChange: (e) => set('includeMind', e.target.checked) }), _jsxs("span", { children: ["Inkludera \u00F6vrig erfarenhet (", Object.values(ALL_EXPERIENCES)
                                    .filter((e) => e.type === 'volunteer')
                                    .map((e) => e.employer)
                                    .join(', '), ")"] })] }) })), _jsxs("div", { className: "cvp-section", children: [_jsx("div", { className: "cvp-sh", children: "Utbildning" }), USER.education.map((u, i) => (_jsxs("div", { className: "cvp-edu", children: [u.name, " \u00B7 ", u.period] }, i)))] }), _jsxs("div", { className: "cvp-section", children: [_jsx("div", { className: "cvp-sh", children: "Kunskaper & \u00F6vrigt" }), _jsx("textarea", { className: "cvp-ta", value: cv.skills, onChange: (e) => set('skills', e.target.value), rows: 2 })] }), _jsx("div", { className: "cvp-footer", children: _jsxs("button", { className: "btn-dl", onClick: onDownload, disabled: loadingDownload || !docxReady, children: [loadingDownload ? _jsx("div", { className: "spinner-dl" }) : '⬇', loadingDownload ? 'Skapar...' : 'Ladda ner .docx'] }) })] }));
}
//# sourceMappingURL=CVPreview.js.map