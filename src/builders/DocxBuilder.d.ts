export interface CvData {
    jobTitle: string;
    about: string;
    experiences: any[];
    includeMind: boolean;
    skills: string;
}
export declare class DocxBuilder {
    cvData: CvData;
    constructor(cvData: CvData);
    build(): Promise<Blob>;
}
//# sourceMappingURL=DocxBuilder.d.ts.map