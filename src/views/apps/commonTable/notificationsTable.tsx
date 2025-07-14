'use client'

import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { toast } from 'react-toastify'
import CustomTextField from '@/@core/components/mui/TextField'
import { NotificationTemplateType } from '@/types/notificationTypes'
import AddNotificationModal from '@/views/pages/notifications/addNotificationModal'
import { useNotificationHooks } from '@/services/useNotificationHooks'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import i18n from '@/i18n'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useTableState } from '@/hooks/useTableState'
import { exportNotificationsToCSV } from './tableExport'

interface NotificationsTableProps {
  notificationsData: NotificationTemplateType[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isLoading: boolean
  setGlobalFilter: (value: string) => void
  globalFilter: string
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
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
} & Omit<React.ComponentProps<typeof CustomTextField>, 'onChange'>) => {
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
  }, [value, onChange])

  return (
    <CustomTextField
      label={t('notifications.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      shrinkLabel={false}
    />
  )
}

const NotificationsTable: FC<NotificationsTableProps> = ({
  notificationsData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  setGlobalFilter,
  globalFilter,
  sorting,
  setSorting
}) => {
  const { t } = useTranslation('global')
  const params = useParams() as { lang: string }
  const currentLocale = params.lang
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { mode: themeMode } = useColorScheme()
  //States
  const [isDelModalOpen, setIsDelModalOpen] = useState(false)
  const [openAddNotificationModal, setOpenAddNotificationModal] = useState(false)
  const [data, setData] = useState<NotificationTemplateType[]>([])
  const [selectedData, setSelectedData] = useState<NotificationTemplateType | null>(null)
  const [mode, setMode] = useState<string | null>(null)
  const [notificationId, setNotificationId] = useState<number | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // hooks
  const { useDeleteNotification, useDeleteNotificationBulk } = useNotificationHooks()
  const { mutate: deleteNotification } = useDeleteNotification()
  const { mutate: deleteNotificationBulk } = useDeleteNotificationBulk()

  useEffect(() => {
    setData(notificationsData)
  }, [[notificationsData]])

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  const handleCloseDeleteModal = () => {
    setIsDelModalOpen(false)
  }

  const handleDeleteNotification = () => {
    if (notificationId === null) return
    deleteNotification(notificationId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setData(prevData => prevData?.filter(delNotificationId => delNotificationId.id !== notificationId))
        toast.success(t('notifications.success.deleted'))
        setIsDelModalOpen(false)
      }
    })
  }

  const handleDeleteNotificationBulk = (ids: number[]) => {
    if (ids.length)
      return deleteNotificationBulk(ids, {
        onSuccess: () => {
          const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
          if (pagination.pageIndex >= newTotalPages) {
            setPagination(prev => ({
              ...prev,
              pageIndex: Math.max(0, newTotalPages - 1)
            }))
          }
          toast.success(t('notifications.success.deleted'))
          setData(prevData => prevData?.filter(delNotificationId => delNotificationId.id !== notificationId))
          setIsDelModalOpen(false)
          setRowSelection({})
        }
      })
    setMultiple(false)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('notifications')

  const handleCloseAddNotificationModal = () => setOpenAddNotificationModal(false)

  const columns = useMemo<MRT_ColumnDef<NotificationTemplateType, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('notifications.name'),
        Cell: ({ cell }: { cell: MRT_Cell<NotificationTemplateType> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('notifications.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<NotificationTemplateType> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('notifications.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<NotificationTemplateType> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('notifications.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<NotificationTemplateType> }) => (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['delete_notification']) && (
              <IconButton
                onClick={() => {
                  setNotificationId(row.original.id)
                  setDelName(row.original.name)
                  setIsDelModalOpen(true)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_notification']) && (
              <IconButton
                onClick={() => {
                  setMode('edit')
                  setSelectedData(row.original)
                  setOpenAddNotificationModal(true)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    [t]
  )

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('notifications.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_notification']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setIsDelModalOpen(true)
                setDelName('')
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('notifications.delNotificationbulk')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_notification']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setOpenAddNotificationModal(true)
                setMode('create')
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('notifications.addNotification')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={data}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={data && data?.length > 1 ? true : false}
          manualSorting={true}
          enableRowSelection
          positionToolbarAlertBanner='none'
          onRowSelectionChange={setRowSelection}
          getRowId={row => String(row.id)}
          onSortingChange={setSorting}
          state={{
            pagination,
            isLoading,
            globalFilter,
            sorting,
            rowSelection,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            isFullScreen: tableState.isFullScreen
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          onPaginationChange={setPagination}
          localization={{
            noRecordsToDisplay: t('notifications.table.noData'),
            rowsPerPage: t('notifications.table.pagination.rowsPerPage'),
            of: t('notifications.table.pagination.of')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportNotificationsToCSV(notificationsData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
              {Object.keys(rowSelection).length > 0 && (
                <div className='flex items-center gap-3'>
                  <Typography variant='body2' color='text.secondary'>
                    {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')} {totalRecords}
                  </Typography>
                  <Button variant='outlined' onClick={() => setRowSelection({})}>
                    {t('table.clearSelection')}
                  </Button>
                </div>
              )}
            </div>
          )}
        />
      </div>
      <AddNotificationModal
        open={openAddNotificationModal}
        handleClose={handleCloseAddNotificationModal}
        mode={mode}
        notificationData={selectedData}
      />
      <DeleteConfModal
        title={t('notifications.delete.title')}
        deleteValue={delName}
        open={isDelModalOpen}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple
            ? handleDeleteNotificationBulk(Object.keys(rowSelection).map(key => Number(key)))
            : handleDeleteNotification()
        }
      />
    </div>
  )
}

export default NotificationsTable
