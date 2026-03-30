// Example PROFILES data for public use. Replace with your own profiles in PROFILES.local.ts (which is gitignored).
export interface Profile {
  label: string;
  emoji: string;
  defaultOutputs: string[];
  cvInstruction: string;
}

export const PROFILES: { [key: string]: Profile } = {
  service: {
    label: 'Service / Store',
    emoji: '🛒',
    defaultOutputs: ['cv', 'coverLetter'],
    cvInstruction: `PROFILE: Service and store jobs.\nINCLUDE IN CV: job1, job2 (all service roles). EXCLUDE: job3, job4.\nSkills: focus on service, customer contact, teamwork.\nTONE: Down-to-earth, concrete.`
  },
  tech: {
    label: 'Frontend Developer / Internship',
    emoji: '💻',
    defaultOutputs: ['cv', 'email', 'linkedin'],
    cvInstruction: `PROFILE: Frontend developer or internship role.\nINCLUDE IN CV: job3, job4. EXCLUDE: service roles (job1, job2).\nSkills: React, TypeScript, JavaScript, HTML, CSS, Figma.\nTONE: Concrete, competence-driven.`
  }
}
