
export interface BrandStrategy {
  platform: string;
  aspectRatio: string;
  layoutStyle: string;
  reasoning: string;
  refinedPrompt: string;
  featuredProduct: string;
}

export interface GenerationResult {
  imageUrl: string | null;
  strategy: BrandStrategy | null;
  error?: string;
}

export enum ProcessingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Analyzing strategy
  GENERATING = 'GENERATING', // Generating image
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ReferenceImage {
  data: string; // Base64 data
  mimeType: string;
}

export interface BrandProfile {
  name: string;
  context: string;
  tone: string;
  colors: string;
  visualStyle: string;
  productDescription: string;
  styleReferenceImages: ReferenceImage[];
  // Google Drive Integration
  googleDriveClientId?: string;
  autoUploadToDrive: boolean;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
