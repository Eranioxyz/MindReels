
export enum ReelType {
  TIDBIT = 'TIDBIT',
  CHALLENGE = 'CHALLENGE',
  EXERCISE = 'EXERCISE',
  MNEMONIC = 'MNEMONIC'
}

export interface ReelContent {
  id: string;
  type: ReelType;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  interaction?: {
    question?: string;
    options?: string[];
    correctAnswer?: string;
    technique?: string;
  };
}

export interface AppState {
  reels: ReelContent[];
  loading: boolean;
  currentIndex: number;
}
