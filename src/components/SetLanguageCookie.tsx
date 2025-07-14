'use client'

import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { useTemplateStore } from '@/store/templateStore'

type Props = {
  lang: string
}

const SetLanguageCookie = ({ lang }: Props) => {
  const { setCurrentLang } = useTemplateStore()
  useEffect(() => {
    if (lang) {
      setCurrentLang(lang)
    }
  }, [lang])

  return null
}

export default SetLanguageCookie
