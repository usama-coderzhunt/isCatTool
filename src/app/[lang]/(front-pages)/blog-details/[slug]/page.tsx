'use client'

import { useBlogHooks } from '@/services/useBlogHooks'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { Chip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import CircularLoader from '@/components/CircularLoader'
import Footer from '@/views/front-pages/landing-page/Footer'

interface Tag {
  id: number
  name: string
  slug: string
}

const BlogDetail = () => {
  const params = useParams() as { lang: string; slug: string }
  const { t } = useTranslation('global') // Use the 'global' namespace
  const [slug, setSlug] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Set slug from params
  useEffect(() => {
    if (params.slug) {
      setSlug(params.slug)
    }
  }, [params.slug])

  // Fetch blog post
  const { useFetchPost, useFetchTags } = useBlogHooks()
  const { data: blogData, isLoading, isError, error } = useFetchPost(slug)

  // Fetch tags
  const { data: tagsData, isLoading: isTagsLoading } = useFetchTags(100, 1, {})

  // Find matching tags for the post
  const getPostTags = (postTags: number[] = [], allTags: Tag[] = []) => {
    return allTags.filter(tag => postTags.includes(tag.id))
  }

  // Loading state
  if (isLoading || isTagsLoading) {
    return (
      <div className='w-screen h-screen flex items-center justify-center'>
        <CircularLoader />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-red-500 text-center'>
          <h2 className='text-xl font-bold'>{t('blog.errorHeading')}</h2>
          <p>{error?.message || t('blog.errorMessage')}</p>
        </div>
      </div>
    )
  }

  // No data state
  if (!blogData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-textSecondary text-center'>
          <h2 className='text-xl font-bold'>{t('blog.notFound')}</h2>
        </div>
      </div>
    )
  }

  const postTags = getPostTags(blogData?.tags, tagsData?.results)

  return (
    <div>
      <article className='max-w-4xl mx-auto px-4 py-8'>
        {/* Featured Image */}
        {blogData.featured_image && (
          <div className='relative w-full h-96 mb-8'>
            <Image
              src={blogData.featured_image}
              alt={blogData.title}
              fill
              className='object-cover rounded-lg'
              priority
              unoptimized
            />
          </div>
        )}

        {/* Title */}
        <h1 className='text-3xl md:text-4xl font-bold mb-4' color='text.primary'>
          {blogData.title}
        </h1>

        {/* Meta Information */}
        <div className='flex items-center text-textSecondary mb-6'>
          <span>
            {t('blog.Published')} {format(new Date(blogData.published_at), 'MMMM dd, yyyy')}
          </span>
        </div>

        {/* Content */}
        <div className='prose prose-lg max-w-none mb-8' dangerouslySetInnerHTML={{ __html: blogData.content }} />

        {/* Views */}
        <div className='mb-6 text-textSecondary'>
          <span className='font-medium'>{t('blog.Views')}:</span> {blogData.views}
        </div>

        {/* Tags */}
        {postTags?.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            <span className='font-medium text-textSecondary'>{t('blog.Tags')}:</span>
            {postTags.map(tag => (
              <Chip label={tag.name} color='primary' variant='outlined' key={tag.id} />
            ))}
          </div>
        )}
      </article>
      <Footer />
    </div>
  )
}

export default BlogDetail
