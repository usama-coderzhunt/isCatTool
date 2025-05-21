'use client'

import { MaterialReactTable, MRT_Cell, MRT_SortingState, type MRT_Row } from 'material-react-table'
import { useTranslation } from 'next-i18next'
import { GroupType } from '@/types/userTypes'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { IconButton, Typography, useColorScheme } from '@mui/material'
import { useRouter, useParams } from 'next/navigation'
import { getDisplayDateTime } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTableState } from '@/hooks/useTableState'

// Define Props Type
interface GroupTableProps {
  groupsData: GroupType[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
  isLoading: boolean
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
  globalFilter: string
  setGlobalFilter: (value: string) => void
  setOpenAddGroupModal: Dispatch<SetStateAction<boolean>>
  setMode: Dispatch<SetStateAction<'create' | 'edit'>>
  setSelectedGroup: Dispatch<SetStateAction<GroupType | null>>
  selectedGroup: GroupType | null
  rowSelection: any
  setRowSelection: any
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 1000,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
}) => {
  const [value, setValue] = useState(initialValue)
  const { t } = useTranslation('global')

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField
    label={t('groups.search')}
    placeholder={t('groups.search')}
    {...props}
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
}

const GroupTable = ({ groupsData, totalRecords, pagination, setPagination, isLoading, sorting, setSorting, globalFilter, setGlobalFilter, setOpenAddGroupModal, setMode, setSelectedGroup, selectedGroup, rowSelection, setRowSelection }: GroupTableProps) => {
  const { t } = useTranslation('global')
  const router = useRouter()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { mode: themeMode } = useColorScheme()

  // States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Api Call
  const { deleteGroup } = useUserManagementHooks()
  const deleteGroupMutation = deleteGroup(selectedGroup?.id ?? null)

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedGroup(null)
  }

  const handleDeleteClick = (group: GroupType) => {
    setSelectedGroup(group)
    setDeleteModalOpen(true)
  }

  const handleEditClick = (group: GroupType) => {
    setSelectedGroup(group)
    setMode('edit')
    setOpenAddGroupModal(true)
  }

  const handleDelete = () => {
    if (!selectedGroup) return
    deleteGroupMutation.mutate(undefined, {
      onSuccess: () => {
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('groups')

  const columns = [
    {
      accessorKey: 'name',
      header: t('groups.name'),
    },
    {
      accessorKey: 'created_at',
      header: t('groups.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<GroupType> }) => (
        <Typography className="font-medium truncate" color="text.primary">
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: t('groups.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<GroupType> }) => (
        <Typography className="font-medium truncate" color="text.primary">
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: 'actions',
      header: t('groups.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<GroupType> }) => (
        <div className="flex items-center gap-2">
          <IconButton
            onClick={() => router.push(`/${currentLocale}/dashboards/group/${row.original.id}`)}
            title={t('groups.view')}
          >
            <i className="tabler-eye text-xl" />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(row.original)}
            disabled={deleteGroupMutation.isPending}
          >
            <i className='tabler-trash text-xl' />
          </IconButton>
          <IconButton
            onClick={() => handleEditClick(row.original)}
          >
            <i className='tabler-edit text-xl' />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <div className={`flex flex-col gap-y-8 ${themeMode === 'light' ? 'customColor' : ''}`}>
      <MaterialReactTable
        columns={columns}
        data={groupsData ?? []}
        manualPagination={true}
        rowCount={totalRecords}
        enableGlobalFilter={false}
        enableColumnFilters={true}
        enableSorting={groupsData && groupsData?.length > 1 ? true : false}
        manualSorting={true}
        enableRowSelection
        onRowSelectionChange={setRowSelection}
        getRowId={row => String(row.id)}
        state={{
          pagination,
          isLoading,
          sorting,
          globalFilter,
          rowSelection,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        onPaginationChange={setPagination}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
        renderTopToolbarCustomActions={() => (
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
          />
        )}
        localization={{
          noRecordsToDisplay: t('groups.table.noData'),
          rowsPerPage: t('groups.table.rowsPerPage'),
          of: t('groups.table.of'),
        }}
        onSortingChange={setSorting}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfModal
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        title={t('groups.delete.title')}
        deleteValue={selectedGroup?.name}
        handleDelete={handleDelete}
      />
    </div>
  )
}

export default GroupTable

