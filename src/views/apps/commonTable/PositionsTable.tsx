'use client'

import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { PositionsTypes } from '@/types/positions'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import CreatePositionDialog from '@/views/pages/positions/CreatePositionDialog'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { formatDate } from '@/utils/utility/formateDate'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTranslation } from 'next-i18next'
import { useParams, usePathname } from 'next/navigation'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import CustomTextField from '@/@core/components/mui/TextField'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { exportPositionsToCSV } from './tableExport'

interface PositionsTableProps {
  positionsData: PositionsTypes[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isLoading: boolean
  deletePosition: any
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
  globalFilter: string
  setGlobalFilter: (value: string) => void
  deletePositionBulk: any
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
      label={t('positionsTable.search')}
      shrinkLabel={false}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}

const PositionsTable: FC<PositionsTableProps> = ({
  positionsData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  deletePosition,
  sorting,
  setSorting,
  globalFilter,
  setGlobalFilter,
  deletePositionBulk
}) => {
  const pathName = usePathname()

  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { mode: themeMode } = useColorScheme()
  //States
  const [isDelModalOpen, setIsDelModalOpen] = useState(false)
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false)
  const [data, setData] = useState<PositionsTypes[]>([])
  const [positionId, setPositionId] = useState<number | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [selectedPosition, setSelectedPosition] = useState<{ id: number; name: string } | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  useEffect(() => {
    setData(positionsData)
  }, [[positionsData]])

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleCloseDeleteModal = () => {
    setIsDelModalOpen(false)
    setPositionId(null)
  }
  const handleClosePositionModal = () => {
    setIsPositionModalOpen(false)
    setMode('create')
    setSelectedPosition(null)
  }

  const handleDeletePosition = () => {
    if (positionId === null) return
    deletePosition.mutate(positionId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setData(prevData => prevData?.filter(position => position.id !== positionId))
        setIsDelModalOpen(false)
        toast.success(t('positionsTable.toasts.positionDeletedSuccess'))
      }
    })
  }

  const handleDeletePositionBulk = (ids: number[]) => {
    if (!ids.length === null) return
    deletePositionBulk.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('positionsTable.toasts.positionDeletedBulkSuccess'))
        setIsDelModalOpen(false)
        setRowSelection({})
      }
    })
    setMultiple(false)
  }

  const handleOpenPositionModal = (position?: { id: number; name: string }) => {
    if (position) {
      setMode('edit')
      setSelectedPosition(position)
    } else {
      setMode('create')
      setSelectedPosition(null)
    }
    setIsPositionModalOpen(true)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('positions')

  const columns = useMemo<MRT_ColumnDef<PositionsTypes, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('positionsTable.positionName'),
        Cell: ({ cell }: { cell: MRT_Cell<PositionsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('positionsTable.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<PositionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('positionsTable.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<PositionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('positionsTable.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<PositionsTypes> }) => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleOpenPositionModal(row.original)}>
              <i className='tabler-edit' />
            </IconButton>
            <IconButton
              onClick={() => {
                setPositionId(row.original.id)
                setDelName(row.original.name)
                setIsDelModalOpen(true)
              }}
              title={t('positionsTable.deletePosition')}
            >
              <i className='tabler-trash text-xl' />
            </IconButton>
          </div>
        )
      }
    ],
    [t]
  )

  return (
    <div className={`flex flex-col gap-y-8 ${themeMode === 'light' ? 'customColor' : ''}`}>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('positionsTable.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_staffposition']) && Object.keys(rowSelection).length ? (
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
              {t('positionsTable.deletePositionBulk')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_staffposition']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setIsPositionModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('positionsTable.addPosition')}
            </Button>
          )}
        </div>
      </div>

      <div className='w-full'>
        <MaterialReactTable
          columns={columns}
          data={data}
          manualPagination={true}
          rowCount={totalRecords}
          enableRowSelection
          positionToolbarAlertBanner='none'
          onRowSelectionChange={setRowSelection}
          getRowId={row => String(row.id)}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={data && data?.length > 1 ? true : false}
          manualSorting={true}
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
          localization={{
            noRecordsToDisplay: t('table.noRecords'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of')
          }}
          onSortingChange={setSorting}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportPositionsToCSV(data)} title={t('table.export')}>
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
      <CreatePositionDialog
        open={isPositionModalOpen}
        onClose={handleClosePositionModal}
        mode={mode}
        positionData={selectedPosition}
      />
      {hasPermissions(userPermissions, ['delete_staffposition']) && (
        <DeleteConfModal
          title={t('positionsTable.confirmDelete')}
          deleteValue={delName}
          open={isDelModalOpen}
          handleClose={handleCloseDeleteModal}
          handleDelete={() =>
            multiple
              ? handleDeletePositionBulk(Object.keys(rowSelection).map(key => Number(key)))
              : handleDeletePosition()
          }
          message={`${t('positionsTable.deleteMessage')} ${delName}?`}
        />
      )}
    </div>
  )
}

export default PositionsTable
