// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useKeenSlider } from 'keen-slider/react'
import classnames from 'classnames'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppKeenSlider from '@/libs/styles/AppKeenSlider'

// SVG Imports
import HubSpot from '@assets/svg/front-pages/landing-page/HubSpot'
import Pinterest from '@assets/svg/front-pages/landing-page/Pinterest'
import Dribbble from '@assets/svg/front-pages/landing-page/Dribbble'
import Airbnb from '@assets/svg/front-pages/landing-page/Airbnb'
import Coinbase from '@assets/svg/front-pages/landing-page/Coinbase'
import Netflix from '@assets/svg/front-pages/landing-page/Netflix'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from './styles.module.css'

import { useTranslation } from 'next-i18next'
import { useFetchTestimonials } from '@/services/useTestimonials'
import { useEffect, useState, useMemo } from 'react'

// SVG mapping
const logoMap = {
  pinterest: <Pinterest color='#ee7676' />,
  netflix: <Netflix color='#d34c4d' />,
  airbnb: <Airbnb color='#FF5A60' />,
  coinbase: <Coinbase color='#0199ff' />,
  dribbble: <Dribbble color='#ea4c89' />,
  hubspot: <HubSpot color='#FF5C35' />
}

const CustomerReviews = () => {
  const { t } = useTranslation()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const getReviewsData = (data: any) => {
    if (!data || !Array.isArray(data)) {
      return []
    }
    return data.map((item, index) => {
      const { name, testimonial: description, position = 'Unknown', rating } = item

      let logo = null
      Object.keys(logoMap).forEach(key => {
        if (position.toLowerCase().includes(key.toLowerCase())) {
          logo = logoMap[key as keyof typeof logoMap]
        }
      })

      if (!logo) logo = logoMap.pinterest

      return {
        desc: description,
        svg: logo,
        rating: rating || 5,
        name,
        position: position,
        avatarSrc: item.image_url || `/images/avatars/${(index % 10) + 1}.png`
      }
    })
  }

  const { data: TestimonialsData } = useFetchTestimonials(pagination.pageSize, pagination.pageIndex + 1)
  const reviewsData = useMemo(() => getReviewsData(TestimonialsData), [TestimonialsData])

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: true,
    mode: 'free-snap',
    rtl: false,
    slides: {
      perView: 3,
      spacing: 12,
      origin: 'center'
    },
    breakpoints: {
      '(max-width: 1200px)': {
        slides: {
          perView: 2,
          spacing: 12,
          origin: 'center'
        }
      },
      '(max-width: 600px)': {
        slides: {
          perView: 1,
          spacing: 12,
          origin: 'center'
        }
      }
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
    defaultAnimation: {
      duration: 800,
      easing: t => t * (2 - t)
    }
  })

  // Reset slider when data changes
  useEffect(() => {
    if (instanceRef.current && loaded) {
      instanceRef.current.update()
    }
  }, [TestimonialsData, loaded])

  useEffect(() => {
    if (instanceRef.current) {
      let timeoutId: NodeJS.Timeout

      const startAutoplay = () => {
        timeoutId = setInterval(() => {
          if (instanceRef.current) {
            instanceRef.current.next()
          }
        }, 4000)
      }

      const stopAutoplay = () => {
        if (timeoutId) {
          clearInterval(timeoutId)
        }
      }

      startAutoplay()

      const sliderElement = instanceRef.current.container

      const handleMouseEnter = () => {
        stopAutoplay()
      }

      const handleMouseLeave = () => {
        startAutoplay()
      }

      sliderElement.addEventListener('mouseenter', handleMouseEnter)
      sliderElement.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        stopAutoplay()
        if (sliderElement) {
          sliderElement.removeEventListener('mouseenter', handleMouseEnter)
          sliderElement.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    }
  }, [instanceRef.current])

  if (!TestimonialsData || !Array.isArray(TestimonialsData)) {
    return null
  }

  return (
    <section className={classnames('flex flex-col gap-8 plb-[100px] bg-backgroundDefault', styles.sectionStartRadius)}>
      <div
        className={classnames('flex max-md:flex-col max-sm:flex-wrap is-full gap-6', frontCommonStyles.layoutSpacing)}
      >
        <div className='flex flex-col gap-1 bs-full justify-center items-center lg:items-start is-full md:is-[30%] mlb-auto sm:pbs-2'>
          <Chip
            label={t('landingPage.customerReviews.label')}
            variant='tonal'
            color='primary'
            size='small'
            className='mbe-3'
          />
          <div className='flex flex-col gap-y-1 flex-wrap max-lg:text-center '>
            <Typography color='text.primary' variant='h4'>
              <span className='relative z-[1] font-extrabold'>
                {t('landingPage.customerReviews.title')}
                <img
                  src='/images/front-pages/landing-page/bg-shape.png'
                  alt='bg-shape'
                  className='absolute block-end-0 z-[1] bs-[40%] is-[132%] inline-start-[-8%] block-start-[17px]'
                />
              </span>
            </Typography>
            <Typography>{t('landingPage.customerReviews.subtitle')}</Typography>
          </div>
          <div className='flex gap-x-4 mbs-11'>
            <CustomIconButton color='primary' variant='tonal' onClick={() => instanceRef.current?.prev()}>
              <i className='tabler-chevron-left' />
            </CustomIconButton>
            <CustomIconButton color='primary' variant='tonal' onClick={() => instanceRef.current?.next()}>
              <i className='tabler-chevron-right' />
            </CustomIconButton>
          </div>
        </div>
        <div className='is-full md:is-[70%] overflow-hidden'>
          <AppKeenSlider>
            <div
              ref={sliderRef}
              className={classnames('keen-slider', {
                'opacity-0': !loaded,
                'opacity-100 transition-opacity duration-300': loaded
              })}
            >
              {reviewsData.map((item, index) => (
                <div key={index} className='keen-slider__slide'>
                  <Card elevation={8} className='flex items-start h-full'>
                    <CardContent className='p-8 items-center mlb-auto h-full'>
                      <div className='flex flex-col gap-4 items-start h-full'>
                        {item.svg}
                        <Typography>{item.desc}</Typography>
                        <Rating value={item.rating} readOnly />
                        <div className='flex items-center gap-x-3 mt-auto'>
                          <CustomAvatar size={32} src={item.avatarSrc} alt={item.name} />
                          <div className='flex flex-col items-start'>
                            <Typography color='text.primary' className='font-medium'>
                              {item.name}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </AppKeenSlider>
        </div>
      </div>
      {/* <Divider /> */}
      {/* <div className='flex flex-wrap items-center justify-center gap-x-16 gap-y-6 mli-3'>
        <Airbnb color='var(--mui-palette-text-secondary)' />
        <Netflix color='var(--mui-palette-text-secondary)' />
        <Dribbble color='var(--mui-palette-text-secondary)' />
        <Coinbase color='var(--mui-palette-text-secondary)' />
        <Pinterest color='var(--mui-palette-text-secondary)' />
      </div> */}
    </section>
  )
}

export default CustomerReviews
