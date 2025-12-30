export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedJsonResult {
  raw: string;
  formatted: string;
  minified: string;
  escaped: string;
}

export type TabOption = 'pretty' | 'minified' | 'escaped' | 'code' | 'flattened' | 'ha_autodetect';