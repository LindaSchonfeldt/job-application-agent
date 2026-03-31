import type { CvData } from '../builders/DocxBuilder';
interface Props {
    cv: CvData;
    onChange: (cv: CvData) => void;
    onDownload: () => void;
    loadingDownload: boolean;
    docxReady: boolean;
}
export declare function CVPreview({ cv, onChange, onDownload, loadingDownload, docxReady }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CVPreview.d.ts.map