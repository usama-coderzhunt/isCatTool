'use client'

import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState } from 'material-react-table'
import { Staff } from '@/types/staffTypes'
import UserDetailsCard from '@/views/pages/client-and-lead-details/userDetailsCard'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import CustomTextField from '@/@core/components/mui/TextField'
import { useColorScheme } from '@mui/material'
import { useTableState } from '@/hooks/useTableState'

interface StaffTableProps {
  rows: Staff[]
  columns: MRT_ColumnDef<Staff, any>[]
  rowCount: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
  isLoading: boolean;
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
  globalFilter: string
  setGlobalFilter: (value: string) => void
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

  return <CustomTextField label={t('staffTable.search')} {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}

const StaffTable: FC<StaffTableProps> = ({
  rows,
  columns,
  rowCount,
  pagination,
  setPagination,
  isLoading,
  sorting,
  setSorting,
  globalFilter,
  setGlobalFilter,
  rowSelection,
  setRowSelection
}) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { mode: themeMode } = useColorScheme()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('staff')

  return (
    <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
      <MaterialReactTable
        columns={columns}
        data={rows}
        manualPagination={true}
        rowCount={rowCount}
        enableGlobalFilter={false}
        enableColumnFilters={true}
        enableRowSelection
        onRowSelectionChange={setRowSelection}
        getRowId={row => String(row.id)}
        enableSorting={rows && rows?.length > 1 ? true : false}
        manualSorting={true}
        state={{
          pagination,
          isLoading,
          sorting,
          rowSelection,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        onPaginationChange={setPagination}
        localization={{
          noRecordsToDisplay: t('table.noRecords'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of'),
        }}
        onSortingChange={setSorting}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
        renderTopToolbarCustomActions={() => (
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder={t('staffTable.search')}
          />
        )}
        renderDetailPanel={({ row }) => <UserDetailsCard row={row.original} />}
      />
    </div>
  )
}

export default StaffTable 
