# Job Application Agent

A personal AI-powered tool for generating tailored job application materials. Paste a job listing, pick a profile, and get a customized CV, cover letter, email, and LinkedIn summary — in Swedish or English.

Built with React, TypeScript, and the Claude API (Anthropic).

---

## What it does

- **Detects language** automatically from the job listing (Swedish/English)
- **Extracts keywords** from the listing and lets you toggle which ones to use
- **Generates application content** based on your profile and experiences:
  - Downloadable CV as a formatted `.docx` file
  - Cover letter
  - Email draft
  - LinkedIn summary
  - "About me" section
- **Lets you edit** the CV inline before downloading

---

## Tech stack

- React 19 + TypeScript
- Vite
- Claude API (`claude-sonnet-4-20250514`) for keyword extraction and content generation
- [`docx`](https://docx.js.org/) for Word document generation (loaded from CDN at runtime)

---

## Project structure

```
src/
├── App.tsx                        # Main UI and API call logic
├── builders/
│   ├── SystemPromptBuilder.ts     # Constructs prompts for the Claude API
│   └── DocxBuilder.ts             # Generates .docx CV files
├── components/
│   └── CVPreview.tsx              # Inline CV editor
└── data/
    ├── USER.ts                    # Template — replace with USER.local.ts
    ├── PROFILES.ts                # Template — replace with PROFILES.local.ts
    ├── ALL_EXPERIENCES.ts         # Template — replace with ALL_EXPERIENCES.local.ts
    └── OUTPUT_META.ts             # Labels for output types
```

### The `.local.ts` pattern

Personal data lives in `.local.ts` files that are gitignored. Vite is configured to resolve them automatically — if a `.local.ts` exists, it takes precedence over the corresponding `.ts` template file.

| Public template | Your private version |
|---|---|
| `USER.ts` | `USER.local.ts` |
| `PROFILES.ts` | `PROFILES.local.ts` |
| `ALL_EXPERIENCES.ts` | `ALL_EXPERIENCES.local.ts` |

This keeps your personal information out of version control while making the codebase shareable.

---

## Setup

```bash
npm install
```

Copy and fill in the local data files:

```bash
cp src/data/USER.ts src/data/USER.local.ts
cp src/data/PROFILES.ts src/data/PROFILES.local.ts
cp src/data/ALL_EXPERIENCES.ts src/data/ALL_EXPERIENCES.local.ts
```

Edit each `.local.ts` file with your own information:

- **`USER.local.ts`** — your name, contact info, and education
- **`ALL_EXPERIENCES.local.ts`** — your work and volunteer history
- **`PROFILES.local.ts`** — application profiles (e.g. "service jobs", "frontend internship") with instructions for which experiences to include and what tone to use

Then start the dev server:

```bash
npx vite
```

The app will be available at `http://localhost:5173`.

---

## Usage

1. Enter your Anthropic API key in the app
2. Select a profile matching the type of job you're applying for
3. Paste the job listing
4. Choose which outputs you want (CV, cover letter, email, etc.)
5. Click **Generera** — the AI will extract keywords and generate all selected content
6. Edit the CV inline if needed, then download as `.docx`

---

## Customization

### Adding a new profile

In `PROFILES.local.ts`, add an entry to the `PROFILES` object:

```ts
my_profile: {
  label: 'My Profile Label',
  emoji: '🎯',
  defaultOutputs: ['cv', 'coverLetter'],
  cvInstruction: `PROFILE: Description of this profile.
INCLUDE IN CV: experience_key_1, experience_key_2.
EXCLUDE: experience_key_3.
Skills: focus on X, Y, Z.
TONE: Concrete and direct.`
}
```

### Adding a new experience

In `ALL_EXPERIENCES.local.ts`, add an entry:

```ts
my_job: {
  title: 'Job Title',
  employer: 'Company Name',
  period: '2023–2024',
  type: 'tech',        // 'tech' | 'service' | 'volunteer'
  details: [
    'Responsibility or achievement',
    'Another bullet point'
  ]
}
```

Volunteer experiences (`type: 'volunteer'`) are rendered under a separate "Other experience" section in the CV and can be toggled independently.
