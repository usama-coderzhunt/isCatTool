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

// Type Imports

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useTranslation } from 'next-i18next'
import { useBlogHooks } from '@/services/useBlogHooks'

// Styles Imports
import styles from '../landing-page/styles.module.css'
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Components
import BlogGrid from './BlogGrid'
import CustomTextField from '@/@core/components/mui/TextField'
import { Post } from '@/types/blogTypes'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 1000,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof CustomTextField>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)
  const { t } = useTranslation('global')

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange])

  return (
    <CustomTextField label={t('common.search')} {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

const BlogsHeroSection = ({ mode }: any) => {
  // Blogs data state
  const [blogs, setBlogs] = useState<Post[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 })
  const [hasMore, setHasMore] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)

  const containerRef = useRef<HTMLDivElement>(null)

  // Theme and styling
  const { mode: muiMode } = useColorScheme()
  const _mode = (muiMode === 'system' ? mode : muiMode) || mode

  // Localization
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  // Blog data fetching
  const { useFetchPosts, useFetchBlogCategoriesPublic } = useBlogHooks()
  const { data: categoriesData } = useFetchBlogCategoriesPublic()
  const {
    data: blogsData,
    isLoading,
    isFetching
  } = useFetchPosts(pagination.pageSize, pagination.pageIndex + 1, {}, globalFilter, selectedCategory)

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

  const handleCategoryChange = (selectedId: string | number | number[] | null) => {
    setSelectedCategory(typeof selectedId === 'number' ? selectedId : undefined)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  return (
    <>
      {/* Hero Section with Background */}
      <section
        id='blogs-hero'
        className='relative plb-[100px] h-[40vh] flex items-center justify-center overflow-hidden'
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
              <Button
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                href={`/${currentLocale}/contact`}
              >
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
          <div
            className={`w-full flex items-center gap-4 lg:max-w-[90%] ${currentLocale === 'ar' ? 'justify-end' : 'justify-start'}`}
          >
            <DebouncedInput value={globalFilter} onChange={setGlobalFilter} placeholder={t('common.search')} />
            <div className='max-w-[200px] w-full'>
              <SearchableMultiSelect<Post>
                options={categoriesData?.results || []}
                name='category'
                returnAsArray={false}
                returnAsString={false}
                labelKey='name'
                value={selectedCategory}
                className='w-full'
                label={t('common.category')}
                multiple={false}
                onChange={handleCategoryChange}
              />
            </div>
          </div>
          <BlogGrid blogs={blogs} handleScroll={handleScroll} isLoading={isLoading} />
        </div>
      </section>
    </>
  )
}

export default BlogsHeroSection
