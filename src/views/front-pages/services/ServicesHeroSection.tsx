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

// Third-party Imports
import classnames from 'classnames'
import { MRT_SortingState } from 'material-react-table'

// Type Imports
import type { SystemMode } from '@core/types'
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
import CustomerReviews from '../landing-page/CustomerReviews'
import Faqs from '../landing-page/Faqs'
import CircularLoader from '@/components/CircularLoader'

const ServicesHeroSection = ({ mode }: { mode: SystemMode }) => {
  const router = useRouter()

  // Services data state
  const [services, setServices] = useState<ServiceTypes[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 })
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [transform, setTransform] = useState('')
  const [totalPages, setTotalPages] = useState(1)

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
  const { getServices } = useServicesHooks()
  const {
    data: servicesData,
    isLoading,
    isFetching
  } = getServices(pagination.pageSize, pagination.pageIndex + 1, getOrderingParam(sorting), globalFilter)

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
      scrollToServices()
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
      window.scrollTo({
        top: 800,
        behavior: 'smooth'
      })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1 && !isFetching) {
      setCurrentPage(prev => prev - 1)
      setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
      window.scrollTo({
        top: 800,
        behavior: 'smooth'
      })
    }
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      setCurrentPage(page)
      setPagination(prev => ({ ...prev, pageIndex: page - 1 }))
      window.scrollTo({
        top: 800,
        behavior: 'smooth'
      })
    }
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
      <section id='home' className='overflow-hidden pbs-[75px] -mbs-[75px] relative'>
        <img
          src={heroSectionBg}
          alt='hero-bg'
          className={classnames('bs-[95%] sm:bs-[85%] md:bs-[80%]', styles.heroSectionBg, {
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
              <Button variant='contained' color='primary' size='large' component={Link} href='/contact'>
                {t('services.contact')}
              </Button>
            </div>
          </div>
        </div>
        <div
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
        </div>
      </section>

      <div className='py-12'>
        <UsefulFeature />
      </div>

      {/* Services Content Section */}
      <section id='services-section' className='max-w-[1200px] mx-auto py-[60px] px-6 bg-backgroundDefault'>
        <div className='flex items-center justify-center mb-10'>
          <Typography variant='h4' className='relative z-[1] font-extrabold text-center'>
            <img
              src='/images/front-pages/landing-page/bg-shape.png'
              alt='bg-shape'
              className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[8%] block-start-[17px]'
            />{' '}
            Services
          </Typography>
        </div>
        <div className='w-full'>
          {isFetching ? (
            <div className='w-full h-full flex items-center justify-center py-10'>
              <CircularLoader />
            </div>
          ) : (
            <ServiceGrid services={services} />
          )}

          {/* Pagination Buttons */}
          <div className='flex justify-between items-center gap-2 mt-8'>
            <Button onClick={() => router.push(`/apps/services`)} variant='contained' color='primary' size='large'>
              See All Services
            </Button>
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
        </div>
      </section>
      <Faqs />
      <CustomerReviews />
    </>
  )
}

export default ServicesHeroSection
