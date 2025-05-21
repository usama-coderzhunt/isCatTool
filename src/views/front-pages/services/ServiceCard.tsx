'use client'
import { ServiceTypes } from '@/types/services'
import { Button, Card, CardContent, Typography } from '@mui/material'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const stripHtmlTags = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

interface ServicesCardProps {
  service: ServiceTypes
}

const ServiceCard: React.FC<ServicesCardProps> = ({ service }) => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const router = useRouter()
  const { t, i18n } = useTranslation('global')

  return (
    <Card
      key={service.id}
      className='relative w-full h-full hover:border hover:border-[var(--mui-palette-primary-main)] hover:shadow-xl transition-all duration-300 ease-in-out'
    >
      <Image className='!relative object-cover !h-[260px] !w-full' src={service?.image} alt={service?.name} fill />
      <CardContent>
        <Typography
          variant='h4'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            lineHeight: '24px',
            wordBreak: 'break-word',
            textAlign: 'left'
          }}
        >
          {service.name}
        </Typography>
        <Typography
          variant='body1'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            lineHeight: '24px',
            wordBreak: 'break-word',
            textAlign: 'left',
            mt: 4
          }}
        >
          {stripHtmlTags(service.short_description)}
        </Typography>
        <div className='mt-5 w-full flex justify-start items-center'>
          <Button
            variant='contained'
            className='bg-primary text-white shadow-md'
            onClick={() => router.push(`/${currentLocale}/service-details/${service.id}`)}
          >
            {t('services.servicePlans.getStarted')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceCard
