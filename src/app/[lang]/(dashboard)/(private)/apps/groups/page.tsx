'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import GroupTable from '@/views/apps/commonTable/GroupTable'
import Grid from '@mui/material/Grid2'
import { Button, Typography } from '@mui/material'
import CreateGroupDialog from '@/views/pages/group/CreateGroupDialog'
import { useParams } from 'next/navigation'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { GroupType } from '@/types/userTypes'
import { toast } from 'react-toastify'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import DeleteConfModal from '@/components/deleteConfirmationModal'


const GroupListingPage = () => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])
  // States
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [globalFilter, setGlobalFilter] = useState('')
  const [openAddGroupModal, setOpenAddGroupModal] = useState(false);
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)


  // Fetch Groups using custom hook
  const { useGroups, useBulkDeleteGroups } = useUserManagementHooks()
  const deleteBulkGroups = useBulkDeleteGroups()
  const { data: groupsData, isLoading, error } = useGroups(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    globalFilter
  )

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length === null) return
    deleteBulkGroups.mutate(ids, {
      onSuccess: () => {
        toast.success('Groups deleted successfully')
        setDeleteModalOpen(false)
        setRowSelection({})
      }
    })
    setMultiple(false)
  }

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex justify-between items-center'>
        <Typography variant='h3'>{t('groups.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_group']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
            >
              Delete Groups
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_group']) && (
            <Button
              variant='contained'
              onClick={() => { setOpenAddGroupModal(true); setMode('create') }}
              className='bg-primary hover:bg-primaryDark'
            >
              {t('groupsPage.addGroup')}
            </Button>
          )}
        </div>
      </div>
      <Grid container spacing={0}>
        <Grid sx={{ width: '100%' }}>
          <GroupTable
            groupsData={groupsData?.results ?? []}
            totalRecords={groupsData?.count ?? 0}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
            sorting={sorting}
            setSorting={setSorting}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            setOpenAddGroupModal={setOpenAddGroupModal}
            setMode={setMode}
            setSelectedGroup={setSelectedGroup}
            selectedGroup={selectedGroup}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </Grid>
      </Grid>
      <CreateGroupDialog open={openAddGroupModal} onClose={() => setOpenAddGroupModal(false)} mode={mode} groupData={selectedGroup} />
      <DeleteConfModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        title={t('groups.delete.title')}
        handleDelete={() => handleBulkDelete(Object.keys(rowSelection).map(key => Number(key)))}
      />
    </div>
  )
}

export default GroupListingPage
