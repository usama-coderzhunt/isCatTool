'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTemplateStore } from '@/store/templateStore'

const MetaDataUpdater = () => {
  const { useLogoSettings } = useAdminSettingsHook()

  const { seoData } = useTemplateStore()

  const { data: logoSettings, isSuccess: logoLoaded } = useLogoSettings()

  useEffect(() => {
    if (!seoData || !logoLoaded) return

    const head = document.head

    const updateMeta = (name: string, content: string) => {
      let tag = head.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        head.appendChild(tag)
      }
      tag.setAttribute('content', content || '')
    }

    updateMeta('description', seoData?.meta_description ?? '')
    updateMeta('keywords', seoData?.seo_keywords ?? '')
    updateMeta('title', seoData?.meta_title ?? '')
    updateMeta('tagline', seoData?.tagline ?? '')

    let iconTag = head.querySelector('link[rel="icon"]')
    if (!iconTag) {
      iconTag = document.createElement('link')
      iconTag.setAttribute('rel', 'icon')
      head.appendChild(iconTag)
    }
    iconTag.setAttribute('href', logoSettings.favicon || '')
  }, [seoData])

  return null
}

export default MetaDataUpdater
