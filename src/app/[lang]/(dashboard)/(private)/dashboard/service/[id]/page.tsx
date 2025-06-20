'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useServicesHooks } from '@/services/useServicesHooks'
import ServiceDetails from '@/views/pages/services/serviceDetails'
import ServicesPlansListing from '@/views/pages/services/servicesPlansListings'
import { useTranslation } from 'react-i18next'
import { Button, Typography } from '@mui/material'
import ServiceFAQS from '@/views/pages/services/serviceFaqs'
import { IntersectionProvider } from '@/contexts/intersectionContext'
import AddFaqsModal from '@/views/pages/services/addFaqsModal'
import { toast } from 'react-toastify'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import ServiceTestimonials from '@/views/pages/services/serviceTestimonials'

const ServiceDetailsPage = () => {
  const params = useParams() as { lang: string; id: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  const router = useRouter()

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const handleNavigation = () => {
    router.push(`/${currentLocale}/apps/services`)
  }

  // states
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [faqData, setFaqData] = useState<{ question: string; answer: string } | null | undefined>(undefined)
  const [serviceId, setServiceId] = useState<string>()
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  // hooks
  const { getServiceById, useEditService } = useServicesHooks()
  const { data: serviceData, isLoading } = getServiceById(serviceId?.toString())
  const { mutate: editService } = useEditService()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useEffect(() => {
    setServiceId(params.id)
  }, [params.id])

  const handleAddModal = () => {
    setOpen(true)
    setMode('create')
    setFaqData(null)
  }

  const handleEditFaq = (question: string, answer: string) => {
    setFaqData({ question, answer })
    setMode('edit')
    setOpen(true)
  }

  const handleDeleteFaq = (question: string) => {
    setQuestionToDelete(question)
    setOpenDeleteModal(true)
  }

  const confirmDeleteFaq = () => {
    if (serviceData?.faq && serviceData?.id && questionToDelete) {
      const formData = new FormData()
      const updatedFaqs = { ...serviceData.faq }
      delete updatedFaqs[questionToDelete]
      formData.append('faq', JSON.stringify(updatedFaqs))

      editService(
        {
          id: serviceData?.id,
          data: formData
        },
        {
          onSuccess: () => {
            toast.success(t('services.faqs.toasts.faqDeletedSuccess'))
            setOpenDeleteModal(false)
            setQuestionToDelete(null)
          }
        }
      )
    }
  }

  const handleClose = () => {
    setOpen(false)
    setFaqData(null)
    setMode('create')
  }
  return (
    <div className='w-full flex flex-col gap-y-10'>
      <Typography variant='h3'>{t('services.serviceDetails')}</Typography>
      <ServiceDetails serviceDetails={serviceData} isLoading={isLoading} handleBtnClick={handleNavigation} />
      {serviceData?.id && (
        <div>
          <ServicesPlansListing serviceId={serviceData?.id?.toString()} serviceData={serviceData} />
          <IntersectionProvider>
            <div className='flex items-center gap-4 mt-4 justify-between gap-x-4 px-6'>
              <Typography variant='h3' className='font-medium'>
                {t('services.faqs.title')}
              </Typography>
              {isSuperUser ||
                (userRole === 'Admin' && (
                  <Button variant='contained' color='primary' className='shadow-2xl' onClick={handleAddModal}>
                    {t('services.faqs.addFaq')}
                  </Button>
                ))}
            </div>
            <ServiceFAQS
              serviceData={serviceData}
              loading={isLoading}
              onEditFaq={handleEditFaq}
              onDeleteFaq={handleDeleteFaq}
              className='p-12 rounded-md bg-backgroundPaper shadow-lg mt-10'
              isDashboardPage={true}
            />
            <AddFaqsModal
              open={open}
              handleClose={handleClose}
              faqData={faqData}
              mode={mode}
              serviceId={serviceData?.id}
              serviceData={serviceData}
            />
            <div className='mt-10'>
              <ServiceTestimonials serviceId={serviceData?.id} />
            </div>
          </IntersectionProvider>

          <DeleteConfModal
            title={t('services.faqs.deleteModalTitle')}
            open={openDeleteModal}
            handleClose={() => setOpenDeleteModal(false)}
            handleDelete={confirmDeleteFaq}
            message={t('services.faqs.deleteMessage', { question: questionToDelete || '' })}
          />
        </div>
      )}
    </div>
  )
}

export default ServiceDetailsPage
