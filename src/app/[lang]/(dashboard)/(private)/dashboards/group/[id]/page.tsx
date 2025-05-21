'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import PermissionsTable from '@/components/tables/PermissionsTable'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import GroupDetails from '@/views/pages/group/groupDetails'
import GroupUsersTable from '@/components/tables/GroupUsersTable'

const GroupDetailsPage = () => {
  const [globalFilter, setGlobalFilter] = useState('')
  const params = useParams()
  const { i18n } = useTranslation('global')
  const { lang: currentLocale } = params as { lang: string }
  const { useGroup, useGroupPermissions, useAssignGroupPermissions } = useUserManagementHooks()
  const assignGroupPermissions = useAssignGroupPermissions()
  const { data: group, isLoading } = useGroup(Number(params.id))
  const { data: groupPermissions, isLoading: loadingGroupPermissions } = useGroupPermissions(Number(params.id))

  const handleUpdate = (checkedPermissions: Set<number>) => {
    if (!group?.id) return
    assignGroupPermissions.mutate({
      group_id: group.id,
      permission_ids: Array.from(checkedPermissions)
    })
  }
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])
  return (
    <div className='flex flex-col gap-y-10'>
      <GroupDetails
        groupDetails={group}
        isLoading={isLoading}
      />
      <GroupUsersTable
        groupId={Number(group?.id)}
        isLoading={isLoading}
      />
      {groupPermissions && (
        <PermissionsTable
          itemPermissions={groupPermissions || []}
          isLoadingPermissions={loadingGroupPermissions}
          itemId={Number(group?.id)}
          handleUpdate={handleUpdate}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}
    </div>
  )
}

export default GroupDetailsPage
