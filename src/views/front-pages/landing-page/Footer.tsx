'use client'
import React from 'react'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTemplateStore } from '@/store/templateStore'
import Image from 'next/image'
import Link from 'next/link'
import CircularLoader from '@/components/CircularLoader'

const Footer = () => {
  const { useFooterSettings, useSocialLinkSettings } = useAdminSettingsHook()
  const { templateName, templateLogo } = useTemplateStore()
  const { data: footerSettings } = useFooterSettings()
  const { data: socialLinkSettings, isLoading: isSocialLinkLoading } = useSocialLinkSettings()
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
            <h3 className='text-lg font-semibold mb-4'>Quick Links</h3>
            <ul className='flex flex-col gap-2'>
              <li>
                <Link href='/home' className='text-sm hover:underline'>
                  Home
                </Link>
              </li>
              <li>
                <Link href='/about' className='text-sm hover:underline'>
                  About Us
                </Link>
              </li>
              <li>
                <Link href='/services' className='text-sm hover:underline'>
                  Services
                </Link>
              </li>
              <li>
                <Link href='/contact' className='text-sm hover:underline'>
                  Contact
                </Link>
              </li>
              <li>
                <Link href='/TermsofService' className='text-sm hover:underline'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href='/privacy-policy' className='text-sm hover:underline'>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Contact Us</h3>
            <ul className='flex flex-col gap-2 text-sm'>
              <li>
                Email:{' '}
                <a href='mailto:Info@IdealisticSolutions.com' className='hover:underline'>
                  Info@IdealisticSolutions.com
                </a>
              </li>
              <li>
                Phone:{' '}
                <a href='tel:+1234567890' className='hover:underline'>
                  +1 (347) 209-8683
                </a>
              </li>
              <li>Address:1747 Olentangy River Rd #1203, Ohio 43212, United States</li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Follow Us</h3>
            {!isSocialLinkLoading ? (
              <ul className='flex flex-col gap-2 text-sm flex-wrap h-[150px]'>
                {Object.entries(socialLinkSettings || {})
                  .filter(
                    ([key]) =>
                      !key.includes('_') &&
                      !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(key)
                  )
                  .map(([key, value]) => (
                    <li key={key}>
                      <Link href={value || '#'} target='_blank' rel='noopener noreferrer' className='hover:underline'>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Link>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className='h-[40px] w-[40px]'>
                <CircularLoader />
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-8 pt-8 border-t border-gray-600 flex items-center justify-between'>
          <p className='text-sm'>{footerSettings?.copyright_text}</p>
          <div className='flex items-center gap-2'>
            <p>
              <Link href='/privacy-policy' className='text-sm hover:underline'>
                Privacy Policy
              </Link>
            </p>
            <span className='text-sm'>|</span>
            <p>
              <Link href='/TermsofService' className='text-sm hover:underline'>
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
