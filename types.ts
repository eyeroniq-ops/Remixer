export interface PreservedDetails {
  typography: boolean;
  style: boolean;
  color: boolean;
  icon: boolean;
  backgroundColor: boolean;
}

export type PreservedDetailKey = keyof PreservedDetails;

export interface OriginalImage {
  base64Data: string;
  mimeType: string;
}
