'use client'

import { Card, Checkbox, Typography, Button, useColorScheme } from '@mui/material'
import React, { useMemo, useState, useEffect } from 'react'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import { usePermissionsHook } from '@/services/usePermissionsHook'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState } from 'material-react-table'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTableState } from '@/hooks/useTableState'
interface ContentType {
  id: number
  app_label: string
  model: string
}

interface Permission {
  id: number
  name: string
  codename: string
  content_type: ContentType
}

interface GroupedPermission {
  model: string
  totalPermissions: number
  permissions: Permission[]
  isSelected: boolean
  isIndeterminate: boolean
}

interface PermissionsTableProps {
  itemPermissions: Permission[]
  isLoadingPermissions: boolean
  itemId: number
  handleUpdate: (checkedPermissions: Set<number>) => void
  globalFilter: string
  setGlobalFilter: (value: string) => void
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
    label={t('permissions.search')}
    placeholder={t('permissions.search')}
    {...props}
    value={value}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
  />
}

const PermissionsTable = ({ itemPermissions, isLoadingPermissions, itemId, handleUpdate, globalFilter, setGlobalFilter }: PermissionsTableProps) => {
  const { t, i18n } = useTranslation('global')
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { mode: themeMode } = useColorScheme()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { useAllAssignablePermissions } = usePermissionsHook()
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const { data: groupedPermissions, isLoading: loadingAssignable } = useAllAssignablePermissions(
    undefined,
    globalFilter
  )
  const [checkedPermissions, setCheckedPermissions] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  useEffect(() => {
    if (itemPermissions) {
      setCheckedPermissions(new Set(itemPermissions.map((p: Permission) => p.id)))
    }
  }, [itemPermissions])

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const handlePermissionToggle = (permissionId: number) => {
    setCheckedPermissions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId)
      } else {
        newSet.add(permissionId)
      }
      return newSet
    })
  }

  const handleModelToggle = (modelPermissions: Permission[]) => {
    const permissionIds = modelPermissions.map(p => p.id)

    setCheckedPermissions(prev => {
      const newSet = new Set(prev)
      const allChecked = permissionIds.every(id => newSet.has(id))

      permissionIds.forEach(id => {
        if (allChecked) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
      })
      return newSet
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('permissions')

  const tableData = useMemo(() => {
    if (!groupedPermissions) return []

    // Transform the data
    const transformedData = Object.entries(groupedPermissions).map(([model, permissions]): GroupedPermission => ({
      model,
      totalPermissions: permissions.length,
      permissions,
      isSelected: permissions.every(p => checkedPermissions.has(p.id)),
      isIndeterminate: permissions.some(p => checkedPermissions.has(p.id)) && !permissions.every(p => checkedPermissions.has(p.id))
    }));

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];

      return transformedData.sort((a, b) => {
        if (id === 'model') {
          return desc
            ? b.model.localeCompare(a.model)
            : a.model.localeCompare(b.model);
        }

        if (id === 'totalPermissions') {
          return desc
            ? b.totalPermissions - a.totalPermissions
            : a.totalPermissions - b.totalPermissions;
        }

        return 0;
      });
    }

    return transformedData;
  }, [groupedPermissions, checkedPermissions, sorting])

  const columns = useMemo<MRT_ColumnDef<GroupedPermission>[]>(() => [
    {
      accessorKey: 'model',
      header: t('permissions.model'),
      Cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Checkbox
            className='text-primary'
            checked={row.original.isSelected}
            indeterminate={row.original.isIndeterminate}
            onChange={(e) => {
              e.stopPropagation()
              handleModelToggle(row.original.permissions)
            }}
          />
          <Typography className='font-medium capitalize'>
            {row.original.model.replace('_', ' ')}
          </Typography>
        </div>
      ),
    },
    {
      accessorKey: 'totalPermissions',
      header: t('permissions.totalPermissions'),
      Cell: ({ row }) => (
        <Typography className='text-sm'>
          {row.original.totalPermissions} {t('permissions.permissions')}
        </Typography>
      ),
    },
  ], [t])

  const renderDetailPanel = ({ row }: { row: { original: GroupedPermission } }) => (
    <div className='bg-gray-50 px-6 py-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {row.original.permissions.map(permission => (
          <div key={permission.id} className='flex items-center gap-3 p-2 rounded hover:bg-gray-100'>
            <Checkbox
              className='text-primary'
              checked={checkedPermissions.has(permission.id)}
              onChange={() => handlePermissionToggle(permission.id)}
            />
            <div className='flex flex-col'>
              <Typography className='text-sm font-medium'>
                {permission.name}
              </Typography>
              <Typography className='text-xs text-gray-500'>
                {permission.codename}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className='flex flex-col gap-8 w-full'>
      <Typography variant='h3' className='font-medium'> {t('permissions.permissions')} </Typography>
      <Card className={`${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={tableData}
          enablePagination={true}
          enableColumnActions={false}
          enableColumnFilters={true}
          enableGlobalFilter={false}
          enableSorting={tableData && tableData?.length > 1 ? true : false}
          manualSorting={true}
          enableExpanding
          renderDetailPanel={renderDetailPanel}
          state={{
            pagination: {
              pageIndex: page,
              pageSize: rowsPerPage,
            },
            globalFilter,
            isLoading: loadingAssignable || isLoadingPermissions,
            sorting,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            isFullScreen: tableState.isFullScreen
          }}
          onSortingChange={setSorting}
          onPaginationChange={(updater: any) => {
            const { pageIndex, pageSize } = updater(
              { pageIndex: page, pageSize: rowsPerPage }
            )
            setPage(pageIndex)
            setRowsPerPage(pageSize)
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          localization={{
            noRecordsToDisplay: t('permissions.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
          }}
          renderTopToolbarCustomActions={() => (
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={(value) => setGlobalFilter(String(value))}
            />
          )}
          renderBottomToolbarCustomActions={() => (
            <div className='pl-4'>
              {hasPermissions(userPermissions, ['change_staff_permissions']) && (
                <Button
                  variant='contained'
                  onClick={() => handleUpdate(checkedPermissions)}
                  className='bg-primary hover:bg-primaryDark'
                  startIcon={<i className='tabler-device-floppy text-lg' />}
                >
                  {t('permissions.updatePermissions')}
                </Button>
              )}
            </div>
          )}
        />
      </Card>
    </div>
  )
}

export default PermissionsTable 
