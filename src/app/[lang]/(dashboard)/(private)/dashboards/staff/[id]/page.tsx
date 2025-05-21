'use client'

import { useParams } from 'next/navigation'
import { useStaffHooks } from '@/services/useStaffHooks'
import StaffDetails from '@/views/pages/staff-details/StaffDetails'
import PermissionsTable from '@/components/tables/PermissionsTable'
import { usePermissionsHook } from '@/services/usePermissionsHook'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import { Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

const StaffDetailsPage = () => {
  const [globalFilter, setGlobalFilter] = useState('')
  const params = useParams()
  const { useStaffMember, useStaffPositions } = useStaffHooks()
  const { t, i18n } = useTranslation ('global')
  const { data: staff, isLoading } = useStaffMember(Number(params.id))
  const { useUserPermissions } = usePermissionsHook()
  const { data: positions } = useStaffPositions()
  const { data: userPermissions, isLoading: loadingUserPermissions } = useUserPermissions(Number(staff?.user))

  const { useAssignUserPermissions } = useUserManagementHooks()
  const assignUserPermissions = useAssignUserPermissions()
  const positionName = positions?.results?.find((p: { id: number }) => p.id === staff?.position)?.name || 'No Position'

  const handleUpdate = (checkedPermissions: Set<number>) => {
    if (!staff?.user) return
    assignUserPermissions.mutate({
      user_id: staff.user,
      permission_ids: Array.from(checkedPermissions)
    })
  }
  return (
    <div className='flex flex-col gap-y-10'>              
      <Typography variant='h4' className='font-semibold'>
          {t('staffDetails.title')}
      </Typography>
            
        <StaffDetails
          staffDetails={staff}
          isLoading={isLoading}
          positionName={positionName}
        />
      <PermissionsTable
        itemPermissions={userPermissions || []}
        isLoadingPermissions={loadingUserPermissions}
        itemId={Number(staff?.user)}
        handleUpdate={handleUpdate}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
    </div>
  )
}

export default StaffDetailsPage
