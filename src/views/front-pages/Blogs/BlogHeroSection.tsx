'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useColorScheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { MRT_SortingState } from 'material-react-table'

// Type Imports
import type { SystemMode } from '@core/types'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useTranslation } from 'next-i18next'
import { useBlogHooks } from '@/services/useBlogHooks'

// Styles Imports
import styles from '../landing-page/styles.module.css'
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Utils
import { getOrderingParam } from '@/utils/utility/sortingFn'

// Components
import BlogGrid from './BlogGrid'

const BlogsHeroSection = ({ mode }: { mode: SystemMode }) => {
  // Blogs data state
  const [blogs, setBlogs] = useState<Post[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 })
  const [hasMore, setHasMore] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)

  // Theme and styling
  const { mode: muiMode } = useColorScheme()
  const _mode = (muiMode === 'system' ? mode : muiMode) || mode

  // Localization
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  // Blog data fetching
  const { useFetchPosts } = useBlogHooks()
  const {
    data: blogsData,
    isLoading,
    isFetching
  } = useFetchPosts(pagination.pageSize, pagination.pageIndex + 1, globalFilter)

  // Background images
  const heroSectionBgLight = '/images/front-pages/landing-page/hero-bg-light.png'
  const heroSectionBgDark = '/images/front-pages/landing-page/hero-bg-dark.png'
  const heroSectionBg = useImageVariant(mode, heroSectionBgLight, heroSectionBgDark)

  // Change language when locale changes
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  // Append new results to current list
  useEffect(() => {
    if (blogsData?.results) {
      setBlogs(prev => (pagination.pageIndex === 0 ? blogsData.results : [...prev, ...blogsData.results]))
      setHasMore(blogsData.results.length === pagination.pageSize)
    }
  }, [blogsData, pagination.pageIndex])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10 // small buffer
    if (bottom && !isFetching && hasMore) {
      setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
    }
  }

  return (
    <>
      {/* Hero Section with Background */}
      <section
        id='blogs-hero'
        className='relative plb-[100px] h-[60vh] flex items-center justify-center overflow-hidden'
      >
        <img
          src={heroSectionBg}
          alt='Blog hero background'
          className={classnames('absolute top-0 left-0 w-full h-full object-cover z-0', styles.heroSectionBg, {
            [styles.bgLight]: _mode === 'light',
            [styles.bgDark]: _mode === 'dark'
          })}
        />

        <div className={classnames('pbs-[88px] overflow-hidden', frontCommonStyles.layoutSpacing)}>
          <div className='md:max-is-[650px] mbs-0 mbe-7 mli-auto text-center relative'>
            <Typography
              className={classnames(
                'font-extrabold sm:text-[42px] text-3xl mbe-4 leading-[48px] text-white',
                styles.heroText
              )}
            >
              {t('blog.heading')}
            </Typography>
            <Typography className='font-bold text-primary'>{t('blog.subheading')}</Typography>
            <div className='flex mbs-6 items-center justify-center gap-4 flex-wrap'>
              <Button variant='contained' color='primary' size='large' component={Link} href='/contact'>
                {t('blog.contact')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs Content Section */}
      <section className='py-12 mx-auto max-w-[1392px] w-full'>
        <div
          ref={containerRef}
          className='w-full flex flex-col mx-auto blogs-container overflow-auto px-4 justify-center items-center'
        >
          <Typography variant='h3' component='h2' className='text-center font-bold mb-6'>
            {t('blog.latestPosts')}
          </Typography>
          <BlogGrid blogs={blogs} handleScroll={handleScroll} isLoading={isLoading} />
        </div>
      </section>
    </>
  )
}

export default BlogsHeroSection
