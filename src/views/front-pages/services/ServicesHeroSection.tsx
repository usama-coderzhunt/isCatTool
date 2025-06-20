'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useColorScheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import IconButton from '@mui/material/IconButton'
import Autocomplete from '@mui/material/Autocomplete'

// Third-party Imports
import classnames from 'classnames'
import { MRT_SortingState } from 'material-react-table'

// Type Imports
import { ServiceTypes } from '@/types/services'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useServicesHooks } from '@/services/useServicesHooks'
import { useTranslation } from 'next-i18next'

// Styles Imports
import styles from '../landing-page/styles.module.css'
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Utils
import { getOrderingParam } from '@/utils/utility/sortingFn'

// Components
import ServiceGrid from './ServiceGrid'
import UsefulFeature from '../landing-page/UsefulFeature'
import CircularLoader from '@/components/CircularLoader'
import CustomTextField from '@/@core/components/mui/TextField'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

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

const ServicesHeroSection = ({ mode }: any) => {
  const router = useRouter()

  // Services data state
  const [services, setServices] = useState<ServiceTypes[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 9,
    globalFilter
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [transform, setTransform] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)

  // Theme and styling
  const { mode: muiMode } = useColorScheme()
  const _mode = (muiMode === 'system' ? mode : muiMode) || mode
  const isAboveLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))

  // Background images
  const heroSectionBgLight = '/images/front-pages/landing-page/hero-bg-light.png'
  const heroSectionBgDark = '/images/front-pages/landing-page/hero-bg-dark.png'
  const dashboardImageLight = '/images/front-pages/landing-page/hero-dashboard-light2.png'
  const dashboardImageDark = '/images/front-pages/landing-page/hero-dashboard-dark2.png'
  const elementsImageLight = '/images/front-pages/landing-page/hero-elements-light.png'
  const elementsImageDark = '/images/front-pages/landing-page/hero-elements-dark.png'

  const dashboardImage = useImageVariant(mode, dashboardImageLight, dashboardImageDark)
  const elementsImage = useImageVariant(mode, elementsImageLight, elementsImageDark)
  const heroSectionBg = useImageVariant(mode, heroSectionBgLight, heroSectionBgDark)

  // Localization
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  // Services data fetching
  const { getFrontPageeServices, getFrontPageCategories } = useServicesHooks()
  const { data: categoriesData } = getFrontPageCategories()
  const { data: servicesData, isFetching } = getFrontPageeServices(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    appliedSearch,
    selectedCategory
  )

  // Change language when locale changes
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const scrollToServices = () => {
    const element = document.getElementById('services-section')
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    if (servicesData?.data) {
      setServices(servicesData.data.results)
      setHasMore(servicesData.data.results.length === pagination.pageSize)
      const total = Math.ceil(servicesData.data.count / pagination.pageSize)
      setTotalPages(total || 1)
    }
  }, [servicesData, pagination.pageSize])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleMouseMove = (event: MouseEvent) => {
        const rotateX = (window.innerHeight - 2 * event.clientY) / 100
        const rotateY = (window.innerWidth - 2 * event.clientX) / 100

        setTransform(
          `perspective(1200px) rotateX(${rotateX < -40 ? -20 : rotateX}deg) rotateY(${rotateY}deg) scale3d(1,1,1)`
        )
      }
      window.addEventListener('mousemove', handleMouseMove)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  const handleNextPage = () => {
    if (hasMore && !isFetching) {
      setCurrentPage(prev => prev + 1)
      setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
      if (currentPage === 1) {
        scrollToServices()
      }
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1 && !isFetching) {
      setCurrentPage(prev => prev - 1)
      setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
      scrollToServices()
    }
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      setCurrentPage(page)
      setPagination(prev => ({ ...prev, pageIndex: page - 1 }))
      if (page > 1) {
        scrollToServices()
      }
    }
  }

  const handleCategoryChange = (selectedId: string | number | number[] | null) => {
    setSelectedCategory(typeof selectedId === 'number' ? selectedId : undefined)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  // Function to generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)

      if (currentPage > 2) {
        pageNumbers.push('...')
      }

      if (currentPage !== 1 && currentPage !== totalPages) {
        pageNumbers.push(currentPage)
      }

      if (currentPage + 1 < totalPages) {
        pageNumbers.push(currentPage + 1)
      }

      if (currentPage + 1 < totalPages - 1) {
        pageNumbers.push('...')
      }

      if (totalPages > 1 && pageNumbers[pageNumbers.length - 1] !== totalPages) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <>
      {/* Hero Section with Background */}
      <section id='home' className='relative plb-[100px] h-[40vh] flex items-center justify-center overflow-hidden'>
        <img
          src={heroSectionBg}
          alt='hero-bg'
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
              {t('services.heading')}
            </Typography>
            <Typography className='font-bold text-primary'>{t('services.subheading')}</Typography>
            <div className='flex mbs-6 items-center justify-center gap-4 flex-wrap'>
              <Button
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                href={`/${currentLocale}/contact`}
              >
                {t('services.contact')}
              </Button>
            </div>
          </div>
        </div>
        {/* <div
          className={classnames('relative text-center', frontCommonStyles.layoutSpacing)}
          style={{ transform: isAboveLgScreen ? transform : 'none' }}
        >
          <Link href='/' target='_blank' className='block relative'>
            <img
              src={dashboardImage}
              alt='dashboard-image'
              className={classnames('mli-auto', styles.heroSecDashboard)}
            />
            <div className={classnames('absolute', styles.heroSectionElements)}>
              <img src={elementsImage} alt='dashboard-elements' />
            </div>
          </Link>
        </div> */}
      </section>

      {/* <div className='py-12'>
        <UsefulFeature />
      </div> */}

      {/* Services Content Section */}
      <section id='services-section' className='max-w-[1200px] mx-auto py-[60px] px-6 bg-backgroundDefault'>
        <div className='flex items-center justify-center mb-10'>
          <Typography variant='h4' className='relative z-[1] font-extrabold text-center'>
            <img
              src='/images/front-pages/landing-page/bg-shape.png'
              alt='bg-shape'
              className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[8%] block-start-[17px]'
            />{' '}
            {t('services.heading')}
          </Typography>
        </div>
        <div
          className={`w-full flex items-center gap-4 lg:max-w-[90%] mb-10 ${currentLocale === 'ar' ? 'justify-end' : 'justify-start'}`}
        >
          <DebouncedInput value={globalFilter} onChange={setGlobalFilter} placeholder={t('common.search')} />
          <div className='max-w-[200px] w-full'>
            <Autocomplete
              options={categoriesData || []}
              getOptionLabel={option => option.name}
              value={categoriesData?.find(cat => cat.id === selectedCategory) || null}
              onChange={(_, newValue) => {
                handleCategoryChange(newValue?.id || null)
              }}
              renderInput={params => <CustomTextField {...params} label={t('common.category')} className='w-full' />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </div>
        </div>
        <div className='w-full'>
          {isFetching ? (
            <div className='w-full h-full flex items-center justify-center py-10'>
              <CircularLoader />
            </div>
          ) : services.length === 0 ? (
            <div className='w-full h-full flex items-center justify-center py-10'>
              <Typography variant='h6' color='textSecondary'>
                No Services Found
              </Typography>
            </div>
          ) : (
            <>
              <ServiceGrid services={services} />

              {/* Pagination Buttons */}
              <div className='flex justify-end items-center gap-2 mt-8'>
                <div className='flex justify-start items-center gap-2'>
                  <IconButton
                    color='primary'
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || isFetching}
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.main', color: 'white' },
                      '&.Mui-disabled': { borderColor: 'action.disabled' }
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>

                  {/* Page Numbers */}
                  <div className='flex gap-1'>
                    {getPageNumbers().map((pageNum, index) =>
                      pageNum === '...' ? (
                        <Typography
                          key={`ellipsis-${index}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40
                          }}
                        >
                          {pageNum}
                        </Typography>
                      ) : (
                        <IconButton
                          key={`page-${pageNum}`}
                          onClick={() => handlePageClick(Number(pageNum))}
                          disabled={isFetching}
                          className={`w-10 h-10 border border-solid border-primary ${
                            currentPage === pageNum ? 'bg-primary text-white' : 'bg-primaryLight text-primary'
                          } hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-all duration-300 ease-in-out`}
                        >
                          {pageNum}
                        </IconButton>
                      )
                    )}
                  </div>

                  <IconButton
                    color='primary'
                    onClick={handleNextPage}
                    disabled={!hasMore || isFetching}
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.main', color: 'white' },
                      '&.Mui-disabled': { borderColor: 'action.disabled' }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default ServicesHeroSection
