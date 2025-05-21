import { create } from 'zustand'

type TemplateStore = {
  templateName: string
  templateLogo: string
  setTemplateName: (name: string) => void
  setTemplateLogo: (logo: string) => void
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templateName: 'IsCatTool',
  templateLogo: '',
  setTemplateName: (name: string) => set({ templateName: name }),
  setTemplateLogo: (logo: string) => set({ templateLogo: logo })
})) 
