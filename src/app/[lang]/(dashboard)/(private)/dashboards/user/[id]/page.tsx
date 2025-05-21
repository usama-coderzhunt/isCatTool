'use client'

import { useEffect, useState } from 'react'
import { usePathname, useParams } from 'next/navigation'
import { Card, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import CircularLoader from '@/components/CircularLoader'
import PermissionsTable from '@/components/tables/PermissionsTable'
import { usePermissionsHook } from '@/services/usePermissionsHook'

import UserGroupsTable from '@/views/apps/commonTable/userGroupsTable'

const UserDetailsPage = () => {
  const { t, i18n } = useTranslation('global')
  const pathname = usePathname()
  const params = useParams() as { lang: string }
  const [globalFilter, setGlobalFilter] = useState('')
  const { lang: currentLocale } = params
  const [userId, setUserId] = useState<number>()
  const { useUser } = useUserManagementHooks()
  const { useAssignUserPermissions } = useUserManagementHooks()
  const { useUserPermissions } = usePermissionsHook()
  const { isLoading: loadingUserPermissions } = useUserPermissions(Number(userId))
  const assignUserPermissions = useAssignUserPermissions()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useEffect(() => {
    const id = Number(pathname.split('/')[pathname.split('/').length - 1])
    setUserId(id)
  }, [pathname])

  const { data: userDetails, isLoading } = useUser(Number(userId))
  const handleUpdate = (checkedPermissions: Set<number>) => {
    if (!userId) return
    assignUserPermissions.mutate({
      user_id: userId,
      permission_ids: Array.from(checkedPermissions)
    })
  }

  console.log("userDetails", userDetails)

  return (
    <div className='w-full flex flex-col gap-y-10'>
      {userId && (
        <>
          <Typography variant='h4' className='font-semibold'>
            {t('userDetails.title')}
          </Typography>
          <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
            {isLoading ? (
              <div className="w-full flex justify-center items-center py-10">
                <CircularLoader />
              </div>
            ) : (
              <div className='px-6 py-4 w-full'>
                <div className='w-full flex flex-col'>
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('userDetails.username')}:
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {userDetails?.username || '-'}
                    </Typography>
                  </div>

                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('userDetails.email')}:
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {userDetails?.email || '-'}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {userDetails?.user_permissions && (
            <PermissionsTable
              itemPermissions={userDetails?.user_permissions || []}
              isLoadingPermissions={loadingUserPermissions}
              itemId={userId}
              handleUpdate={handleUpdate}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          )}

          {userDetails?.groups && userDetails?.groups.length > 0 && (
            <UserGroupsTable userGroupsData={userDetails?.groups || []} />
          )}
        </>
      )}
    </div>
  )
}

export default UserDetailsPage 
