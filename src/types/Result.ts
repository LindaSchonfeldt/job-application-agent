import type { CvData } from './CvData';

export interface Result {
  cv?: CvData;
  [key: string]: any;
}
