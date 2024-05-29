import { create } from 'zustand';

interface TranscriptionState {
    fullTranscription: string;
    setFullTranscription: (transcription: string | ((prev: string) => string)) => void;
}

const useTranscriptionStore = create<TranscriptionState>((set) => ({
    fullTranscription: '',
    setFullTranscription: (transcription) => {
        set((state) => ({
            fullTranscription: 
                typeof transcription === 'function' 
                ? transcription(state.fullTranscription) 
                : transcription
        }));
    },
}));

export default useTranscriptionStore;
