import { Button, Card, CardContent, Typography, CardMedia, CardActions, Box } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import type { Post } from '@/types/blogTypes'

interface BlogCardProps {
  blog: Post
}

// Utility function to truncate text with ellipsis and strip HTML
const truncateText = (text: string, maxLength: number) => {
  // Remove HTML tags
  const strippedText = text.replace(/<[^>]*>?/gm, '')

  if (strippedText.length <= maxLength) return strippedText

  return strippedText.substring(0, maxLength) + '...'
}

// Format date to a more readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const router = useRouter()
  const { t } = useTranslation('global')

  return (
    <Card
      key={blog.id}
      className='relative w-full max-w-full mx-auto hover:border-2 hover:border-[var(--mui-palette-primary-main)] hover:shadow-xl flex flex-col transition-all duration-300 ease-in-out'
      sx={{
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}
    >
      <CardMedia
        component='img'
        height='240'
        image={blog.featured_image ? blog.featured_image : '/images/pages/placeholder-image.webp'}
        alt={blog.title}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent className='flex flex-col gap-y-1 p-5'>
        <Typography
          variant='h5'
          className='font-bold'
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
            marginBottom: '0.5rem'
          }}
        >
          {blog.title}
        </Typography>

        {blog.published_at && (
          <Typography variant='caption' color='text.secondary' className='mt-3'>
            {formatDate(blog.published_at)}
          </Typography>
        )}

        <Typography variant='body1' color='text.secondary' className='mt-3'>
          {truncateText(blog.content, 150)}
        </Typography>
      </CardContent>

      <CardActions className='flex justify-center mt-auto p-5'>
        {' '}
        <Button
          variant='contained'
          size='medium'
          className='bg-primaryLight text-primary shadow-md'
          onClick={() => router.push(`/${currentLocale}/blog-details/${blog.slug}`)}
        >
          {t('blog.readMore')}
        </Button>
      </CardActions>
    </Card>
  )
}

export default BlogCard
