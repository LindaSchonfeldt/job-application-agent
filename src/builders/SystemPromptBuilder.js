import { PROFILES } from '../data/PROFILES';
import { ALL_EXPERIENCES } from '../data/ALL_EXPERIENCES';
import { USER } from '../data/USER';
export class SystemPromptBuilder {
    profile;
    keywords;
    outputs;
    language;
    constructor(profile, keywords, outputs, language = 'sv') {
        this.profile = profile;
        this.keywords = keywords;
        this.outputs = outputs;
        this.language = language;
    }
    build() {
        const p = PROFILES[this.profile];
        const en = this.language === 'en';
        const kwNote = this.keywords.size > 0
            ? en
                ? `\nKEYWORDS TO USE NATURALLY: ${[...this.keywords].join(', ')}\n`
                : `\nNYCKELORD ATT ANVÄNDA NATURLIGT: ${[...this.keywords].join(', ')}\n`
            : '';
        const needEmail = this.outputs.has('email');
        const needLinkedin = this.outputs.has('linkedin');
        const needCoverLetter = this.outputs.has('coverLetter');
        const needAbout = this.outputs.has('about');
        const expData = JSON.stringify(ALL_EXPERIENCES, null, 2);
        const educationList = USER.education.map((e, i) => `${i + 1}. ${e.name}, ${e.period}`).join('\n');
        const contactLine = `${USER.contact} · ${USER.website}`;
        const emailSignatureEN = `Best regards,\\n${USER.name}\\n${USER.contact}`;
        const emailSignatureSV = `Med vänlig hälsning,\\n${USER.name}\\n${USER.contact}`;
        if (en) {
            return `You are an assistant helping ${USER.name} write tailored job application materials.

${USER.name.toUpperCase()} – BACKGROUND:
Contact: ${contactLine}
${kwNote}
AVAILABLE EXPERIENCES (JSON keys to use in the response):
${expData}

EDUCATION (always include, in this order):
${educationList}

PROFILE INSTRUCTIONS (${p.label}):
${p.cvInstruction}

GENERAL RULES:
- Months capitalized (Jan, Feb, Mar, etc.)
- Avoid starting multiple consecutive sentences with "I"
- No generic phrases like "driven", "passionate", "results-oriented" without concrete evidence
- English throughout

YOU MUST GENERATE THE FOLLOWING JSON KEYS:

cv: object with these fields:
  - jobTitle: string (suitable title for the CV header based on profile and role)
  - about: string (2–4 sentences, tailored to the role)
  - experiences: array of { key: string (from ALL_EXPERIENCES), titleOverride?: string, bullets: string[] } — select relevant experiences and rewrite the bullet points to match THIS specific role. Max 3 bullets per role.
  - includeMind: boolean
  - skills: string (one line, bullet-separated, tailored to the role)

${needAbout ? 'about: string (same as cv.about, ready to copy)\n' : ''}${needEmail ? `email: string (subject line on the first line, blank line, then body. Short and direct, max 5–6 sentences. End with "${emailSignatureEN}")\n` : ''}${needLinkedin ? 'linkedin: string (3–4 sentences, no greeting, no signature, direct and personal)\n' : ''}${needCoverLetter ? 'coverLetter: string (3–4 paragraphs, separated by \\n\\n)\n' : ''}
Respond ONLY with valid JSON. No markdown characters.`;
        }
        return `Du är en assistent som hjälper ${USER.name} skriva anpassade ansökningshandlingar.

${USER.name.toUpperCase()} – BAKGRUND:
Kontakt: ${contactLine}
${kwNote}
TILLGÄNGLIGA ERFARENHETER (JSON-nycklar att använda i svaret):
${expData}

UTBILDNING (alltid med, i denna ordning):
${educationList}

INSTRUKTIONER FÖR PROFIL (${p.label}):
${p.cvInstruction}

GENERELLA REGLER:
- Liten bokstav på månader (jan, feb, mars osv.)
- Undvik att börja flera meningar i rad med "Jag"
- Inga generiska fraser som "driven", "passionerad", "resultatinriktad" utan konkret belägg
- Svenska genomgående

DU SKA GENERERA FÖLJANDE JSON-NYCKLAR:

cv: objekt med dessa fält:
  - jobTitle: string (passande titel för CV-headern baserat på profil och tjänst)
  - about: string (2–4 meningar, anpassad till tjänsten)
  - experiences: array av { key: string (från ALL_EXPERIENCES), titleOverride?: string, bullets: string[] } — välj vilka erfarenheter som ska med och skriv om punkterna så de är relevanta för JUST DENNA tjänst. Använd max 3 punkter per roll.
  - includeMind: boolean
  - skills: string (en rad, punktseparerad, anpassad till tjänsten)

${needAbout ? 'about: string (samma som cv.about, redo att kopiera)\n' : ''}${needEmail ? `email: string (ämnesrad på första raden, blankrad, sedan brödtext. Kort och direkt, max 5–6 meningar. Avsluta med "${emailSignatureSV}")\n` : ''}${needLinkedin ? 'linkedin: string (3–4 meningar, ingen hälsning, ingen signatur, direkt och personlig)\n' : ''}${needCoverLetter ? 'coverLetter: string (3–4 stycken, separerade med \\n\\n)\n' : ''}
Svara ENDAST med giltig JSON. Inga markdown-tecken.`;
    }
}
//# sourceMappingURL=SystemPromptBuilder.js.map