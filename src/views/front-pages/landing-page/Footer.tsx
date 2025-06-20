'use client'
import React, { useEffect } from 'react'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTemplateStore } from '@/store/templateStore'
import Image from 'next/image'
import Link from 'next/link'
import CircularLoader from '@/components/CircularLoader'
import { useParams, usePathname } from 'next/navigation'
import { useTranslation } from 'next-i18next'
const Footer = () => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  const { useFooterSettings, useSocialLinkSettings } = useAdminSettingsHook()
  const { templateName, templateLogo } = useTemplateStore()
  const { data: footerSettings } = useFooterSettings()
  const { data: socialLinkSettings, isLoading: isSocialLinkLoading } = useSocialLinkSettings()

  const routesToShowFooter = [
    `/${currentLocale}/home`,
    `/${currentLocale}/about`,
    `/${currentLocale}/services`,
    `/${currentLocale}/blogs`,
    `/${currentLocale}/contact`,
    `/${currentLocale}/service-details/[id]`,
    `/${currentLocale}/terms-of-service`,
    `/${currentLocale}/privacy-policy`
    // Dynamic path
  ]

  useEffect(() => {
    i18n.changeLanguage(currentLocale as string)
  }, [currentLocale, i18n])
  const pathname = usePathname()
  return (
    <footer
      className='relative bg-cover bg-center text-white py-12'
      style={{
        backgroundImage: `url('/images/front-pages/landing-page/footer-bg-light.png')`
      }}
    >
      {/* Overlay for better text readability */}
      <div className='absolute inset-0 bg-gray-950 opacity-85'></div>

      {/* Footer Content */}
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {routesToShowFooter.some(route => pathname.startsWith(route)) && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {/* Company Information */}
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                {templateLogo && <Image src={templateLogo} alt='logo' width={35} height={35} priority />}
                <p className='text-lg font-bold'>{templateName}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>{t('footer.quick_links')}</h3>
              <ul className='flex flex-col gap-2'>
                <li>
                  <Link href={`/${currentLocale}/home`} className='text-sm hover:underline'>
                    {t('footer.home')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${currentLocale}/about`} className='text-sm hover:underline'>
                    {t('footer.about_us')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${currentLocale}/services`} className='text-sm hover:underline'>
                    {t('footer.services')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${currentLocale}/contact`} className='text-sm hover:underline'>
                    {t('footer.contact')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${currentLocale}/privacy-policy`} className='text-sm hover:underline'>
                    {t('footer.privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${currentLocale}/terms-of-service`} className='text-sm hover:underline'>
                    {t('footer.terms_of_service')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>{t('footer.contact_us')}</h3>
              <ul className='flex flex-col gap-2 text-sm'>
                <li>
                  {t('footer.email')}:{' '}
                  <a href='mailto:Info@IdealisticSolutions.com' className='hover:underline'>
                    Info@IdealisticSolutions.com
                  </a>
                </li>
                <li>
                  {t('footer.phone')}:{' '}
                  <a href='tel:+1234567890' className='hover:underline'>
                    +1 (347) 209-8683
                  </a>
                </li>
                <li>{t('footer.address')}:1747 Olentangy River Rd #1203, Ohio 43212, United States</li>
              </ul>
            </div>

            {/* Social Media Links */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>{t('footer.follow_us')}</h3>
              {!isSocialLinkLoading ? (
                <ul className='flex gap-4 flex-wrap list-none h-[100px] max-w-[210px]'>
                  {Object.entries(socialLinkSettings || {})
                    .filter(
                      ([key]) =>
                        !key.includes('_') &&
                        !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(key)
                    )
                    .map(([key, value]) => {
                      const imageKey = `${key}_image`
                      const imageUrl = socialLinkSettings?.[imageKey as keyof typeof socialLinkSettings]

                      return imageUrl ? (
                        <li className='decoration-none' key={key}>
                          <Link
                            href={value || '#'}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block hover:opacity-80 transition-opacity'
                          >
                            <Image
                              src={imageUrl as string}
                              alt={`${key} icon`}
                              width={40}
                              height={40}
                              className='w-[40px] h-[40px]'
                            />
                          </Link>
                        </li>
                      ) : null
                    })}
                </ul>
              ) : (
                <div className='h-[40px] w-[40px]'>
                  <CircularLoader />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Copyright */}
        <div
          className={`${routesToShowFooter.some(route => pathname.startsWith(route)) && 'mt-8 pt-8 border-t'} border-gray-600 flex items-center justify-between`}
        >
          <p className='text-sm'>{footerSettings?.copyright_text}</p>
          <div className='flex items-center gap-2'>
            <p>
              <Link href={`/${currentLocale}/privacy-policy`} className='text-sm hover:underline'>
                {t('footer.privacy_policy')}
              </Link>
            </p>
            <span className='text-sm'>|</span>
            <p>
              <Link href={`/${currentLocale}/terms-of-service`} className='text-sm hover:underline'>
                {t('footer.terms_of_service')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
