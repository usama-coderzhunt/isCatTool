import { create } from 'zustand'

import Cookies from 'js-cookie'

type SeoData = {
  meta_title: string
  tagline: string
  meta_description: string
  seo_keywords: string
  favicon?: string
}

type TemplateStore = {
  templateName: string | null
  templateLogo: string
  seoData: SeoData | null
  currentLang: string
  setTemplateName: (name: string) => void
  setTemplateLogo: (logo: string) => void
  setSeoData: (data: SeoData) => void
  setCurrentLang: (lang: string) => void
}

export const useTemplateStore = create<TemplateStore>(set => ({
  templateName: 'IsCatTool',
  templateLogo: '',
  seoData: null,
  currentLang: 'en',

  setTemplateName: (name: string) => set({ templateName: name }),
  setTemplateLogo: (logo: string) => set({ templateLogo: logo }),
  setSeoData: (data: SeoData) => set({ seoData: data }),
  setCurrentLang: (lang: string) => {
    Cookies.set('i18nextLng', lang, { expires: 365, path: '/' })
    set({ currentLang: lang })
  }
}))
