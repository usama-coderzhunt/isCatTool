'use client'
// Component Imports
import DocsListing from "@/views/pages/client-and-lead-details/docsListing"
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect } from "react"
import { useTranslation } from 'react-i18next'
import { useParams } from "next/navigation"

const Listings = () => {
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { lang } = useParams()
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const { i18n } = useTranslation()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  return (
    <>
      <DocsListing userPermissions={userPermissions} />
    </>
  )
}

export default Listings
