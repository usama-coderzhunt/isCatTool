'use client'

import { useParams, usePathname } from 'next/navigation'
import { Card } from '@mui/material'
import { useStaffHooks } from '@/services/useStaffHooks'
import { usePermissionsHook } from '@/services/usePermissionsHook'
import CircularLoader from '@/components/CircularLoader'
import PermissionsTable from '@/components/tables/PermissionsTable'
import { useEffect, useState } from 'react'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'

const StaffDetails = () => {
  const params = useParams()
  const pathname = usePathname()
  const [userId, setUserId] = useState<number>()
  const { useStaffMember, useStaffPositions } = useStaffHooks()
  const { useAllAssignablePermissions } = usePermissionsHook()

  const { data: staff, isLoading: staffLoading } = useStaffMember(Number(params.id))
  const { data: positions } = useStaffPositions()
  const { data: permissions, isLoading: permissionsLoading } = useAllAssignablePermissions()
  useEffect(() => {
    const id = Number(pathname.split('/')[pathname.split('/').length - 1])
    setUserId(id)
  }, [pathname])

  
  const {useUser, useAssignUserPermissions } = useUserManagementHooks()
  const { useUserPermissions } = usePermissionsHook()
  const { data: userDetails, isLoading } = useUser(Number(userId))
  const { data: userPermissions, isLoading: loadingUserPermissions } = useUserPermissions(Number(userId))
  const assignUserPermissions = useAssignUserPermissions()
  const handleUpdate = (checkedPermissions: Set<number>) => {
    if (!userId) return
    assignUserPermissions.mutate({
      user_id: userId,
      permission_ids: Array.from(checkedPermissions)
    })
  }

  if (staffLoading || permissionsLoading) return <CircularLoader />

  const position = positions?.results?.find((p: { id: number }) => p.id === staff?.position)
  const positionName = position?.name || 'No Position'

  return (
    <div className='space-y-6'>
      <Card className='p-6 bg-[#1B2531]'>
        <h4 className='text-xl font-medium text-white mb-6'>Staff Details</h4>
        <div className='space-y-4'>
          <div className='flex items-center border-b border-[#313C4B] py-4'>
            <div className='flex items-center gap-3 w-1/2'>
              <i className='tabler-user text-[#7C8B9D]' />
              <span className='text-[#7C8B9D]'>Full Name</span>
            </div>
            <span className='text-white'>{`${staff?.first_name} ${staff?.middle_name || ''} ${staff?.last_name}`}</span>
          </div>
          <div className='flex items-center border-b border-[#313C4B] py-4'>
            <div className='flex items-center gap-3 w-1/2'>
              <i className='tabler-mail text-[#7C8B9D]' />
              <span className='text-[#7C8B9D]'>Email</span>
            </div>
            <span className='text-white'>{staff?.email}</span>
          </div>
          <div className='flex items-center border-b border-[#313C4B] py-4'>
            <div className='flex items-center gap-3 w-1/2'>
              <i className='tabler-phone text-[#7C8B9D]' />
              <span className='text-[#7C8B9D]'>Phone Number</span>
            </div>
            <span dir='ltr' className='text-white'>{staff?.phone_number}</span>
          </div>
          <div className='flex items-center border-b border-[#313C4B] py-4'>
            <div className='flex items-center gap-3 w-1/2'>
              <i className='tabler-briefcase text-[#7C8B9D]' />
              <span className='text-[#7C8B9D]'>Position</span>
            </div>
            <span className='text-white'>{positionName}</span>
          </div>
          <div className='flex items-center border-b border-[#313C4B] py-4'>
            <div className='flex items-center gap-3 w-1/2'>
              <i className='tabler-circle-check text-[#7C8B9D]' />
              <span className='text-[#7C8B9D]'>Status</span>
            </div>
            <span className='text-white'>{staff?.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </Card>

      <Card className='p-6 bg-[#1B2531]'>
        <h4 className='text-xl font-medium text-white mb-6'>Permissions</h4>
        <PermissionsTable 
              itemPermissions={userDetails?.user_permissions || []}
              isLoadingPermissions={loadingUserPermissions} 
              itemId={Number(userId)}
              handleUpdate={handleUpdate}
            />
      </Card>
    </div>
  )
}

export default StaffDetails 
