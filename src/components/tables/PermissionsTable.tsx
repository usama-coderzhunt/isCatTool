'use client'

import React, { useMemo, useState, useEffect } from 'react'

import { useParams, usePathname } from 'next/navigation'

import { Card, Checkbox, Typography, Button, useColorScheme, Tooltip } from '@mui/material'

import type { MRT_ColumnDef, MRT_SortingState } from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { useTranslation } from 'next-i18next'

import { usePermissionsHook } from '@/services/usePermissionsHook'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'

import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTableState } from '@/hooks/useTableState'
import TranslationModelPermissionModal from '@/views/pages/translationModels/translationModelPermissionModal'
import BusinessUnitAssignToUserModal from '@/views/pages/business-units/businnessUnitAssignToUserModal'

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
  globalFilter?: string
  setGlobalFilter?: (value: string) => void
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 1000,
  placeholder,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
  placeholder?: string
}) => {
  const { t, i18n } = useTranslation('global')
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <CustomTextField
      label={t('permissions.search')}
      shrinkLabel={false}
      {...props}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      className='w-full max-w-xs'
    />
  )
}

const PermissionsTable = ({
  itemPermissions,
  isLoadingPermissions,
  itemId,
  handleUpdate,
  globalFilter,
  setGlobalFilter
}: PermissionsTableProps) => {
  const { t, i18n } = useTranslation('global')
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { mode: themeMode } = useColorScheme()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { useAllAssignablePermissions } = usePermissionsHook()
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [sortingRight, setSortingRight] = useState<MRT_SortingState>([])
  const pathname = usePathname()
  const isUserDetailsPage = pathname.includes('user')

  const { data: groupedPermissions, isLoading: loadingAssignable } = useAllAssignablePermissions(
    undefined,
    globalFilter
  )

  const [checkedLeftPermissions, setCheckedLeftPermissions] = useState<Set<number>>(new Set())
  const [checkedRightPermissions, setCheckedRightPermissions] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(0)
  const [pageRight, setPageRight] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [rowsPerPageRight, setRowsPerPageRight] = useState(5)
  const [globalFilterLeft, setGlobalFilterLeft] = useState('')
  const [globalFilterRight, setGlobalFilterRight] = useState('')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBusinessUnitModalOpen, setIsBusinessUnitModalOpen] = useState(false)

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('permissions')

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const handleAddPermissions = () => {
    const newPermissions = new Set([...itemPermissions.map(p => p.id), ...Array.from(checkedLeftPermissions)])

    handleUpdate(newPermissions)
    setCheckedLeftPermissions(new Set())
  }

  const handleRemovePermissions = () => {
    const currentPermissionIds = new Set(itemPermissions.map(p => p.id))
    const newPermissions = new Set(Array.from(currentPermissionIds).filter(id => !checkedRightPermissions.has(id)))

    handleUpdate(newPermissions)
    setCheckedRightPermissions(new Set())
  }

  const handleSinglePermissionAdd = (permissionId: number) => {
    const newPermissions = new Set([...itemPermissions.map(p => p.id), permissionId])

    handleUpdate(newPermissions)
  }

  const handleSinglePermissionRemove = (permissionId: number) => {
    const newPermissions = new Set(itemPermissions.map(p => p.id).filter(id => id !== permissionId))

    handleUpdate(newPermissions)
  }

  const handleModelAdd = (modelPermissions: Permission[]) => {
    const newPermissionIds = modelPermissions.map(p => p.id)
    const newPermissions = new Set([...itemPermissions.map(p => p.id), ...newPermissionIds])

    handleUpdate(newPermissions)
  }

  const handleModelRemove = (modelPermissions: Permission[]) => {
    const modelPermissionIds = new Set(modelPermissions.map(p => p.id))
    const newPermissions = new Set(itemPermissions.map(p => p.id).filter(id => !modelPermissionIds.has(id)))

    handleUpdate(newPermissions)
  }

  const handleModelToggleLeft = (modelPermissions: Permission[]) => {
    const permissionIds = modelPermissions.map(p => p.id)

    setCheckedLeftPermissions(prev => {
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

  const handleModelToggleRight = (modelPermissions: Permission[]) => {
    const permissionIds = modelPermissions.map(p => p.id)

    setCheckedRightPermissions(prev => {
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

  const handleAddTranslationModelPermission = () => {
    setIsModalOpen(true)
  }

  // Filter available permissions (exclude already assigned ones)
  const availableGroupedPermissions = useMemo(() => {
    if (!groupedPermissions) return {}

    const assignedPermissionIds = new Set(itemPermissions.map(p => p.id))
    const filtered: { [key: string]: Permission[] } = {}

    Object.entries(groupedPermissions).forEach(([model, permissions]) => {
      const availablePermissions = permissions.filter(p => !assignedPermissionIds.has(p.id))

      if (availablePermissions.length > 0) {
        filtered[model] = availablePermissions
      }
    })

    return filtered
  }, [groupedPermissions, itemPermissions])

  // Group assigned permissions by model
  const assignedGroupedPermissions = useMemo(() => {
    if (!itemPermissions.length) return {}

    const grouped: { [key: string]: Permission[] } = {}

    itemPermissions.forEach(permission => {
      // Use the same format as available permissions: app_label.model
      const model = `${permission.content_type.app_label}.${permission.content_type.model}`

      if (!grouped[model]) {
        grouped[model] = []
      }

      grouped[model].push(permission)
    })

    return grouped
  }, [itemPermissions])

  // Filter assigned permissions by search
  const filteredAssignedPermissions = useMemo(() => {
    if (!globalFilterRight) return assignedGroupedPermissions

    const filtered: { [key: string]: Permission[] } = {}

    Object.entries(assignedGroupedPermissions).forEach(([model, permissions]) => {
      const filteredPermissions = permissions.filter(
        permission =>
          permission.name.toLowerCase().includes(globalFilterRight.toLowerCase()) ||
          permission.codename.toLowerCase().includes(globalFilterRight.toLowerCase()) ||
          model.toLowerCase().includes(globalFilterRight.toLowerCase())
      )

      if (filteredPermissions.length > 0) {
        filtered[model] = filteredPermissions
      }
    })

    return filtered
  }, [assignedGroupedPermissions, globalFilterRight])

  // Filter available permissions by search
  const filteredAvailablePermissions = useMemo(() => {
    if (!globalFilterLeft) return availableGroupedPermissions

    const filtered: { [key: string]: Permission[] } = {}

    Object.entries(availableGroupedPermissions).forEach(([model, permissions]) => {
      const filteredPermissions = permissions.filter(
        permission =>
          permission.name.toLowerCase().includes(globalFilterLeft.toLowerCase()) ||
          permission.codename.toLowerCase().includes(globalFilterLeft.toLowerCase()) ||
          model.toLowerCase().includes(globalFilterLeft.toLowerCase())
      )

      if (filteredPermissions.length > 0) {
        filtered[model] = filteredPermissions
      }
    })

    return filtered
  }, [availableGroupedPermissions, globalFilterLeft])

  const leftTableData = useMemo(() => {
    const transformedData = Object.entries(filteredAvailablePermissions).map(
      ([model, permissions]): GroupedPermission => ({
        model,
        totalPermissions: permissions.length,
        permissions,
        isSelected: false,
        isIndeterminate: false
      })
    )

    if (sorting.length > 0) {
      const { id, desc } = sorting[0]

      return transformedData.sort((a, b) => {
        if (id === 'model') {
          return desc ? b.model.localeCompare(a.model) : a.model.localeCompare(b.model)
        }

        if (id === 'totalPermissions') {
          return desc ? b.totalPermissions - a.totalPermissions : a.totalPermissions - b.totalPermissions
        }

        return 0
      })
    }

    return transformedData
  }, [filteredAvailablePermissions, sorting])

  const rightTableData = useMemo(() => {
    const transformedData = Object.entries(filteredAssignedPermissions).map(
      ([model, permissions]): GroupedPermission => ({
        model,
        totalPermissions: permissions.length,
        permissions,
        isSelected: false,
        isIndeterminate: false
      })
    )

    if (sortingRight.length > 0) {
      const { id, desc } = sortingRight[0]

      return transformedData.sort((a, b) => {
        if (id === 'model') {
          return desc ? b.model.localeCompare(a.model) : a.model.localeCompare(b.model)
        }

        if (id === 'totalPermissions') {
          return desc ? b.totalPermissions - a.totalPermissions : a.totalPermissions - b.totalPermissions
        }

        return 0
      })
    }

    return transformedData
  }, [filteredAssignedPermissions, sortingRight])

  const leftColumns = useMemo<MRT_ColumnDef<GroupedPermission>[]>(
    () => [
      {
        accessorKey: 'model',
        header: t('permissions.model'),
        Cell: ({ row }) => {
          const isSelected = row.original.permissions.every(p => checkedLeftPermissions.has(p.id))
          const isIndeterminate = row.original.permissions.some(p => checkedLeftPermissions.has(p.id)) && !isSelected

          return (
            <div className='flex items-center gap-3'>
              <Checkbox
                className='text-primary'
                checked={isSelected}
                indeterminate={isIndeterminate}
                onChange={e => {
                  e.stopPropagation()
                  handleModelToggleLeft(row.original.permissions)
                }}
              />
              <Typography className='font-medium capitalize'>{row.original.model.replace('_', ' ')}</Typography>
            </div>
          )
        }
      },
      {
        accessorKey: 'totalPermissions',
        header: t('permissions.totalPermissions'),
        Cell: ({ row }) => (
          <Typography className='text-sm'>
            {row.original.totalPermissions} {t('permissions.permissions')}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('common.actions'),
        Cell: ({ row }) => (
          <Tooltip title={t('permissions.addModelPermissions', { model: row.original.model })} arrow>
            <Button
              size='small'
              color='primary'
              onClick={() => handleModelAdd(row.original.permissions)}
              className='min-w-0 p-2'
            >
              <i className='tabler-circle-plus text-lg' />
            </Button>
          </Tooltip>
        ),
        enableSorting: false
      }
    ],
    [t, checkedLeftPermissions, handleModelAdd]
  )

  const rightColumns = useMemo<MRT_ColumnDef<GroupedPermission>[]>(
    () => [
      {
        accessorKey: 'model',
        header: t('permissions.model'),
        Cell: ({ row }) => {
          const isSelected = row.original.permissions.every(p => checkedRightPermissions.has(p.id))
          const isIndeterminate = row.original.permissions.some(p => checkedRightPermissions.has(p.id)) && !isSelected

          return (
            <div className='flex items-center gap-3'>
              <Checkbox
                className='text-primary'
                checked={isSelected}
                indeterminate={isIndeterminate}
                onChange={e => {
                  e.stopPropagation()
                  handleModelToggleRight(row.original.permissions)
                }}
              />
              <Typography className='font-medium capitalize'>{row.original.model.replace('_', ' ')}</Typography>
            </div>
          )
        }
      },
      {
        accessorKey: 'totalPermissions',
        header: t('permissions.totalPermissions'),
        Cell: ({ row }) => (
          <Typography className='text-sm'>
            {row.original.totalPermissions} {t('permissions.permissions')}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('common.actions'),
        Cell: ({ row }) => (
          <Tooltip title={t('permissions.removeModelPermissions', { model: row.original.model })} arrow>
            <Button
              size='small'
              color='error'
              onClick={() => handleModelRemove(row.original.permissions)}
              className='min-w-0 p-2'
            >
              <i className='tabler-circle-minus text-lg' />
            </Button>
          </Tooltip>
        ),
        enableSorting: false
      }
    ],
    [t, checkedRightPermissions, handleModelRemove]
  )

  const renderLeftDetailPanel = ({ row }: { row: { original: GroupedPermission } }) => (
    <div className='bg-backgroundDefault px-6 py-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {row.original.permissions.map(permission => (
          <div
            key={permission.id}
            className='flex items-center justify-between gap-3 p-3 rounded-lg border border-divider bg-backgroundPaper shadow-sm hover:shadow-md hover:bg-action-hover transition-all duration-200'
          >
            <div className='flex flex-col'>
              <Typography className='text-sm font-medium'>{permission.name}</Typography>
              <Typography className='text-xs text-textSecondary'>{permission.codename}</Typography>
            </div>
            <Tooltip title={t('permissions.addPermissionTooltip', { name: permission.name })} arrow>
              <Button
                size='small'
                variant='text'
                color='primary'
                onClick={() => handleSinglePermissionAdd(permission.id)}
                className='min-w-0 p-1'
              >
                <i className='tabler-circle-plus text-lg' />
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRightDetailPanel = ({ row }: { row: { original: GroupedPermission } }) => (
    <div className='bg-backgroundDefault px-6 py-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {row.original.permissions.map(permission => (
          <div
            key={permission.id}
            className='flex items-center justify-between gap-3 p-3 rounded-lg border border-divider bg-backgroundPaper shadow-sm hover:shadow-md hover:bg-action-hover transition-all duration-200'
          >
            <div className='flex flex-col'>
              <Typography className='text-sm font-medium'>{permission.name}</Typography>
              <Typography className='text-xs text-textSecondary'>{permission.codename}</Typography>
            </div>
            <Tooltip title={t('permissions.removePermissionTooltip', { name: permission.name })} arrow>
              <Button
                size='small'
                variant='text'
                color='error'
                onClick={() => handleSinglePermissionRemove(permission.id)}
                className='min-w-0 p-1'
              >
                <i className='tabler-circle-minus text-lg' />
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )

  const hasPermissionsToAdd = checkedLeftPermissions.size > 0
  const hasPermissionsToRemove = checkedRightPermissions.size > 0

  return (
    <div className='flex flex-col gap-8 w-full'>
      {isUserDetailsPage && (
        <div className='w-full flex flex-wrap items-center justify-between gap-3'>
          <Typography variant='h3' className='font-medium'>
            {t('permissions.permissions')}
          </Typography>
          <div className='flex flex-row gap-3'>
            <Button variant='contained' color='primary' onClick={handleAddTranslationModelPermission}>
              {t('permissions.addTranslationModelPermission')}
            </Button>
            <Button variant='contained' color='primary' onClick={() => setIsBusinessUnitModalOpen(true)}>
              {t('permissions.businessUnitAssignToUser')}
            </Button>
          </div>
        </div>
      )}

      <div className='flex flex-col lg:flex-row gap-6 w-full'>
        {/* Left Table - Available Permissions */}
        <div className='flex-1 w-full lg:w-[49%]'>
          <div className='flex justify-between items-center mb-4 mt-4'>
            <Typography variant={isUserDetailsPage ? 'h4' : 'h3'} className='font-medium'>
              {t('permissions.availablePermissions')}
            </Typography>
            {hasPermissionsToAdd && (
              <Button
                variant='contained'
                onClick={handleAddPermissions}
                className='bg-primary hover:bg-primaryDark'
                startIcon={<i className='tabler-circle-plus text-lg' />}
              >
                {t('permissions.addSelectedPermissions')}
              </Button>
            )}
          </div>

          <Card className={`${themeMode === 'light' ? 'customColor' : ''}`}>
            <MaterialReactTable
              columns={leftColumns}
              data={leftTableData}
              enablePagination={true}
              enableColumnActions={false}
              enableColumnFilters={true}
              enableGlobalFilter={false}
              enableSorting={leftTableData && leftTableData?.length > 1}
              manualSorting={false}
              enableExpanding
              enableRowSelection={false}
              enableSelectAll={false}
              enableToolbarInternalActions={false}
              positionToolbarAlertBanner='none'
              enableBatchRowSelection={false}
              getRowId={row => row?.model || `${Math.random()}`}
              renderDetailPanel={renderLeftDetailPanel}
              state={{
                pagination: {
                  pageIndex: page,
                  pageSize: rowsPerPage
                },
                globalFilter: globalFilterLeft,
                isLoading: loadingAssignable || isLoadingPermissions,
                sorting,
                columnVisibility: tableState.columnVisibility,
                density: tableState.density
              }}
              onSortingChange={setSorting}
              onPaginationChange={(updater: any) => {
                const { pageIndex, pageSize } = updater({ pageIndex: page, pageSize: rowsPerPage })

                setPage(pageIndex)
                setRowsPerPage(pageSize)
              }}
              onColumnVisibilityChange={updateColumnVisibility}
              onDensityChange={updateDensity}
              localization={{
                noRecordsToDisplay: t('permissions.noAvailablePermissions'),
                rowsPerPage: t('table.rowsPerPage'),
                of: t('table.of')
              }}
              renderTopToolbarCustomActions={() => (
                <div className='flex items-center gap-4'>
                  <DebouncedInput
                    value={globalFilterLeft}
                    onChange={value => setGlobalFilterLeft(String(value))}
                    placeholder={t('permissions.search')}
                  />
                </div>
              )}
            />
          </Card>
        </div>

        {/* Right Table - Assigned Permissions */}
        <div className='flex-1 w-full lg:w-[49%]'>
          <div className='flex justify-between items-center mb-4 mt-4'>
            <Typography variant={isUserDetailsPage ? 'h4' : 'h3'} className='font-medium'>
              {t('permissions.assignedPermissions')}
            </Typography>
            {hasPermissionsToRemove && (
              <Button
                variant='contained'
                onClick={handleRemovePermissions}
                className='bg-error hover:bg-errorDark'
                startIcon={<i className='tabler-circle-minus text-lg' />}
              >
                {t('permissions.removeSelectedPermissions')}
              </Button>
            )}
          </div>

          <Card className={`${themeMode === 'light' ? 'customColor' : ''}`}>
            <MaterialReactTable
              columns={rightColumns}
              data={rightTableData}
              enablePagination={true}
              enableColumnActions={false}
              enableColumnFilters={true}
              enableGlobalFilter={false}
              enableSorting={rightTableData && rightTableData?.length > 1}
              manualSorting={false}
              enableExpanding
              enableRowSelection={false}
              enableSelectAll={false}
              enableToolbarInternalActions={false}
              positionToolbarAlertBanner='none'
              enableBatchRowSelection={false}
              getRowId={row => row?.model || `${Math.random()}`}
              renderDetailPanel={renderRightDetailPanel}
              state={{
                pagination: {
                  pageIndex: pageRight,
                  pageSize: rowsPerPageRight
                },
                globalFilter: globalFilterRight,
                isLoading: isLoadingPermissions,
                sorting: sortingRight,
                columnVisibility: tableState.columnVisibility,
                density: tableState.density
              }}
              onSortingChange={setSortingRight}
              onPaginationChange={(updater: any) => {
                const { pageIndex, pageSize } = updater({ pageIndex: pageRight, pageSize: rowsPerPageRight })

                setPageRight(pageIndex)
                setRowsPerPageRight(pageSize)
              }}
              onColumnVisibilityChange={updateColumnVisibility}
              onDensityChange={updateDensity}
              localization={{
                noRecordsToDisplay: t('permissions.noAssignedPermissions'),
                rowsPerPage: t('table.rowsPerPage'),
                of: t('table.of')
              }}
              renderTopToolbarCustomActions={() => (
                <div className='flex items-center gap-4'>
                  <DebouncedInput
                    value={globalFilterRight}
                    onChange={value => setGlobalFilterRight(String(value))}
                    placeholder={t('permissions.search')}
                  />
                </div>
              )}
            />
          </Card>
        </div>
      </div>

      <TranslationModelPermissionModal
        open={isModalOpen}
        handleClose={setIsModalOpen}
        title={t('translationModelPermissionModal.title')}
        userId={itemId}
      />

      <BusinessUnitAssignToUserModal
        open={isBusinessUnitModalOpen}
        handleClose={setIsBusinessUnitModalOpen}
        title={t('businessUnitAssignToUserModal.title')}
        userId={itemId}
      />
    </div>
  )
}

export default PermissionsTable
