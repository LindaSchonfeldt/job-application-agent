export declare class SystemPromptBuilder {
    profile: string;
    keywords: Set<string>;
    outputs: Set<string>;
    language: 'sv' | 'en';
    constructor(profile: string, keywords: Set<string>, outputs: Set<string>, language?: 'sv' | 'en');
    build(): string;
}
//# sourceMappingURL=SystemPromptBuilder.d.ts.map