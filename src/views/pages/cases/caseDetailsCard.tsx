'use client'

import { useRouter } from 'next/navigation'
import { Button, Card, Typography } from '@mui/material'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { hasPermissions } from '@/utils/permissionUtils'

const CaseDetailsCard = ({ row, userPermissions }: { row: any, userPermissions: { codename: string }[] }) => {
    const router = useRouter()
    const { t } = useTranslation('global')
    const params = useParams()
    const currentLocale = params.lang as string

    return (
        <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
            <div className='px-6 py-4 w-full'>
                <div className='flex items-center justify-end gap-4 mb-4'>
                    {hasPermissions(userPermissions, ['change_case']) && (
                        <Button
                            sx={{
                                width: 'max-content',
                                padding: '0.5rem 1rem'
                            }}
                            variant='contained'
                            color='primary'
                            onClick={() => router.push(`/${currentLocale}/dashboards/case/${row.id}`)}
                        >
                            {t('cases.details.openDetailedView')}
                        </Button>
                    )}
                </div>
                <div className='w-full flex flex-col'>
                    <div className='flex items-center py-3 gap-x-4'>
                                <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                    {t('cases.details.title')}:
                                </Typography>
                                <Typography 
                                    color='text.secondary' 
                                    className='flex-1'
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.2em',
                                    }}
                                >
                                    {row.title}
                                </Typography>
                    </div>
                    <div className='flex items-center py-3 gap-x-4'>
                                <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                                    {t('cases.details.summary')}:
                                </Typography>
                                <Typography 
                                    color='text.secondary' 
                                    className='flex-1'
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.2em',
                                    }}
                                >
                                    {row.summary}
                                </Typography>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default CaseDetailsCard
