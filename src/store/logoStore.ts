import { create } from 'zustand';

type LogoStore = {
  selectedLogoType: string;
  selectedLogo: string | null;
  handleLogoTypeChange: (type: string) => void;
  setSelectedLogo: (logo: any) => void;
  handleLogoUpload: ( type: string, id: any, file: File, updateFn: any) => void;
};

export const useLogoStore = create<LogoStore>((set) => ({
  selectedLogoType: 'light_logo',
  selectedLogo: null,
  handleLogoTypeChange: (type) => set({ selectedLogoType: type }),
  setSelectedLogo: (logo) => set({ selectedLogo: logo}),
  handleLogoUpload: ( type, id, file, updateFn) => {
    const formData = new FormData();
    formData.append(type, file);
    updateFn({id,formData});
  }
})); 
