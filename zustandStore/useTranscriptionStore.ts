import { create } from 'zustand';

interface TranscriptionState {
    fullTranscription: string;
    setFullTranscription: (transcription: string) => void;
}

const useTranscriptionStore = create<TranscriptionState>((set) => ({
    fullTranscription: '',
    setFullTranscription: (transcription) => set({ fullTranscription: transcription }),
}));

export default useTranscriptionStore;
