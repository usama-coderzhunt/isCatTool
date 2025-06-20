'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

// MUI Imports
import { Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell } from 'material-react-table'

// Hooks & Services
import { getDisplayValue } from '@/utils/utility/displayValue'
import { toast } from 'react-toastify'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTableState } from '@/hooks/useTableState'

export type GroupTypes = {
  id: number
  name: string
}

interface UserGroupsTableProps {
  userGroupsData: GroupTypes[]
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
    <CustomTextField label={t('common.search')} {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

const UserGroupsTable: React.FC<UserGroupsTableProps> = ({ userGroupsData }: UserGroupsTableProps) => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()

  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState<GroupTypes[]>([])

  useEffect(() => {
    setData(userGroupsData)
  }, [userGroupsData])

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('userGroups')

  const columns = [
    {
      accessorKey: 'name',
      header: t('groups.name'),
      Cell: ({ cell }: { cell: MRT_Cell<GroupTypes> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'business_unit',
      header: t('groups.businessUnit'),
      Cell: ({ cell }: { cell: MRT_Cell<GroupTypes> }) => getDisplayValue(cell.getValue())
    }
  ]

  return (
    <div className={`w-full flex flex-col gap-y-8 ${themeMode === 'light' ? 'customColor' : ''}`}>
      <Typography variant='h3' className='font-medium'>
        {t('groups.userGroups')}
      </Typography>
      <MaterialReactTable
        columns={columns}
        data={data}
        manualPagination={true}
        manualSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        muiPaginationProps={{
          getItemAriaLabel: type => t(`table.pagination.${type}`)
        }}
        state={{
          globalFilter,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        renderTopToolbarCustomActions={() => (
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder={t('groups.search')}
          />
        )}
        localization={{
          noRecordsToDisplay: t('table.noData'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of')
        }}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
      />
    </div>
  )
}

export default UserGroupsTable
