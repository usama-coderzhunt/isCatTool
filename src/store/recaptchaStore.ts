import { create } from 'zustand'

interface RecaptchaStore {
    recaptchaToken: string | null;
    setRecaptchaToken: (token: string | null) => void;
}

export const useRecaptchaStore = create<RecaptchaStore>((set) => ({
    recaptchaToken: null,
    setRecaptchaToken: (token) => set({ recaptchaToken: token }),
}));
