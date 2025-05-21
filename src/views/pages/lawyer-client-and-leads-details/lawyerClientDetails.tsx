import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'

import { Button, Card, Chip, Typography } from '@mui/material'

import CircularLoader from '@/components/CircularLoader'
import { LawyerClientTypes } from '@/types/lawyerClients'

const LawyerClientDetails = ({ lawyerClientDetails, isLoading }: { lawyerClientDetails: LawyerClientTypes, isLoading: boolean }) => {
    const params = useParams() as { lang: string }
    const { lang: currentLocale } = params
    const { t } = useTranslation('global')

    const handleNavigation = () => {
        window.location.href = `/${currentLocale}/apps/lawyer-clients`
    }

    return (
        <>
            <Typography variant='h4' className='font-semibold'>
                {t('lawyerClients.table.title')}
            </Typography>
            <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
                {isLoading ? (
                    <div className='w-full h-full flex items-center justify-center py-10'>
                        <CircularLoader />
                    </div>
                ) : !lawyerClientDetails || Object.keys(lawyerClientDetails).length === 0 ? (
                    <div className='w-full h-full flex items-center justify-center py-10'>
                        <Typography variant='h6'>Client Data not found</Typography>
                    </div>
                ) : (
                    <div className='px-6 py-4 w-full'>
                        <div className='w-full flex flex-col'>
                            <div className='grid grid-cols-2 gap-x-8'>
                                {/* Left Column */}
                                <div>
                                    {/* Full Name Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.fullName')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {[lawyerClientDetails?.first_name, lawyerClientDetails?.middle_name, lawyerClientDetails?.last_name]
                                                .filter(Boolean)
                                                .join(' ') || '-'}
                                        </Typography>
                                    </div>

                                    {/* First Name Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.firstName')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {lawyerClientDetails?.first_name?.length ? lawyerClientDetails?.first_name : '-'}
                                        </Typography>
                                    </div>

                                    {/* Middle Name Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.middleName')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {lawyerClientDetails?.middle_name?.length ? lawyerClientDetails?.middle_name : '-'}
                                        </Typography>
                                    </div>

                                    {/* Last Name Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.lastName')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {lawyerClientDetails?.last_name?.length ? lawyerClientDetails?.last_name : '-'}
                                        </Typography>
                                    </div>

                                    {/* Email Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.email')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {lawyerClientDetails?.email?.length ? lawyerClientDetails?.email : '-'}
                                        </Typography>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div>
                                    {/* Phone Number Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.phoneNumber')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            <span dir="ltr">
                                                {lawyerClientDetails?.phone_number?.length ? lawyerClientDetails?.phone_number : '-'}
                                            </span>
                                        </Typography>
                                    </div>

                                    {/* Status Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.status')}:
                                        </Typography>
                                        <Chip
                                            label={lawyerClientDetails?.is_active ? t('lawyerClients.table.active') : t('lawyerClients.table.inactive')}
                                            color={lawyerClientDetails?.is_active ? 'success' : 'error'}
                                            size='small'
                                            variant='tonal'
                                        />
                                    </div>

                                    {/* Client Type Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.clientType')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1 capitalize'>
                                            {lawyerClientDetails?.client_type?.length ? lawyerClientDetails?.client_type : '-'}
                                        </Typography>
                                    </div>

                                    {/* Created At Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.createdAt')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {lawyerClientDetails?.created_at?.length ? new Date(lawyerClientDetails.created_at)?.toDateString() : '-'}
                                        </Typography>
                                    </div>

                                    {/* Converted To Client Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.convertedToClient')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {lawyerClientDetails?.converted_to_client?.length
                                                ? new Date(lawyerClientDetails.converted_to_client)?.toDateString()
                                                : '-'}
                                        </Typography>
                                    </div>

                                    {/* Notes Row */}
                                    <div className='flex items-center py-3 gap-x-4'>
                                        <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                            {t('lawyerClients.table.notes')}:
                                        </Typography>
                                        <Typography color='text.secondary' className='flex-1'>
                                            {lawyerClientDetails?.notes?.length ? lawyerClientDetails?.notes : '-'}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='w-full flex items-center justify-start mt-10'>
                            <Button
                                onClick={handleNavigation}
                                variant='contained'
                                color='primary'
                                className='shadow-2xl'
                            >
                                {t('lawyerClients.details.backToList')}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </>
    )
}

export default LawyerClientDetails
