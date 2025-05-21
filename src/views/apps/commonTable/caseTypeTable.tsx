'use client'

import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { CaseTypes } from '@/types/cases'
import { useCasesHooks } from '@/services/useCases'
import AddCaseTypeModal from '@/views/pages/caseType/addCaseTypeModal'

interface CaseTypeTableProps {
    caseTypeData: CaseTypes[]
    totalRecords: number
    pagination: { pageSize: number; pageIndex: number }
    setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
    isLoading: boolean;
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

    return <CustomTextField label={t('caseTypes.table.search')} {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}

const CaseTypeTable: FC<CaseTypeTableProps> = ({
    caseTypeData,
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
    const userPermissions = useAuthStore(state => state.userPermissions)
    const { mode: themeMode } = useColorScheme()

    //States
    const [openAddModal, setOpenAddModal] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedCaseType, setSelectedCaseType] = useState<CaseTypes | null>(null)
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [rowSelection, setRowSelection] = useState({})
    const [multiple, setMultiple] = useState(false)

    // Api Call
    const { deleteCaseType, useBulkDeleteCaseType } = useCasesHooks()
    const deleteCaseTypeMutation = deleteCaseType(selectedCaseType?.id ?? null)
    const bulkDeleteCaseTypeMutation = useBulkDeleteCaseType()

    const handleCloseAddModal = () => {
        setOpenAddModal(false)
        setSelectedCaseType(null)
        setMode('create')
    }

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false)
        setSelectedCaseType(null)
        setMultiple(false)
    }

    const handleDeleteClick = (caseType: CaseTypes) => {
        setSelectedCaseType(caseType)
        setDeleteModalOpen(true)
    }

    const handleBulkDelete = (ids: number[]) => {
        if (!ids.length === null) return
        bulkDeleteCaseTypeMutation.mutate(ids, {
            onSuccess: () => {
                toast.success(t('caseTypes.toastMessages.bulkDeleted'))
                setDeleteModalOpen(false)
                setRowSelection({})
                setMultiple(false)
            }
        })
    }

    const handleEditClick = (caseType: CaseTypes) => {
        setSelectedCaseType(caseType)
        setMode('edit')
        setOpenAddModal(true)
    }

    const handleDelete = () => {
        if (!selectedCaseType) return
        deleteCaseTypeMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success(t('caseTypes.toastMessages.deleted'))
                handleCloseDeleteModal()
            }
        })
    }

    const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('caseType')

    const columns = useMemo<MRT_ColumnDef<CaseTypes, any>[]>(() => [
        {
            accessorKey: 'name',
            header: t('caseTypes.table.name'),

            Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
                <Typography className="font-medium" color="text.primary">
                    {getDisplayValue(cell.getValue())}
                </Typography>
            ),
        },
        {
            accessorKey: 'created_at',
            header: t('caseTypes.table.createdAt'),
            Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
                <Typography className="font-medium truncate" color="text.primary">
                    {getDisplayDateTime(cell.getValue())}
                </Typography>
            ),
        },
        {
            accessorKey: 'updated_at',
            header: t('caseTypes.table.updatedAt'),
            Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
                <Typography className="font-medium truncate" color="text.primary">
                    {getDisplayDateTime(cell.getValue())}
                </Typography>
            ),
        },
        {
            accessorKey: 'actions',
            header: t('caseTypes.table.actions'),
            enableSorting: false,
            enableColumnFilter: false,
            Cell: ({ row }: { row: MRT_Row<CaseTypes> }) => (
                <div className='flex items-center gap-1'>
                    {hasPermissions(userPermissions, ['delete_casetype']) && (
                        <IconButton
                            onClick={() => handleDeleteClick(row.original)}
                            disabled={deleteCaseTypeMutation.isPending}
                        >
                            <i className='tabler-trash text-xl' />
                        </IconButton>
                    )}
                    {hasPermissions(userPermissions, ['change_casetype']) && (
                        <IconButton onClick={() => handleEditClick(row.original)}>
                            <i className='tabler-edit text-xl' />
                        </IconButton>
                    )}
                </div>
            ),
        }
    ], [deleteCaseTypeMutation.isPending, t])

    return (
        <div className='flex flex-col gap-y-8'>
            <div className='flex items-center justify-between'>
                <Typography variant='h3'>{t('caseTypes.title')}</Typography>
                <div className='flex flex-row gap-2'>
                    {hasPermissions(userPermissions, ['delete_casetype']) && Object.keys(rowSelection).length ? (
                        <Button
                            variant='contained'
                            color='error'
                            onClick={() => {
                                setMultiple(true)
                                setDeleteModalOpen(true)
                            }}
                            sx={{ padding: '0.5rem 1rem' }}
                        >
                            {t('caseTypes.buttons.delete')}
                        </Button>
                    ) : (
                        <></>
                    )}
                    {hasPermissions(userPermissions, ['add_casetype']) && (
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                setMode('create')
                                setOpenAddModal(true)
                            }}
                            sx={{ padding: '0.5rem 1rem' }}
                        >
                            {t('caseTypes.buttons.create')}
                        </Button>
                    )}
                </div>
            </div>
            <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
                <MaterialReactTable
                    columns={columns}
                    data={caseTypeData}
                    manualPagination={true}
                    rowCount={totalRecords}
                    enableGlobalFilter={false}
                    enableColumnFilters={true}
                    enableSorting={caseTypeData && caseTypeData?.length > 1 ? true : false}
                    manualSorting={true}
                    onGlobalFilterChange={setGlobalFilter}
                    enableRowSelection
                    onRowSelectionChange={setRowSelection}
                    getRowId={row => String(row.id)}
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
                    onSortingChange={setSorting}
                    onPaginationChange={setPagination}
                    muiPaginationProps={{
                        getItemAriaLabel: (type) => t(`table.pagination.${type}`)
                    }}
                    localization={{
                        noRecordsToDisplay: t('caseTypes.table.noData'),
                        rowsPerPage: t('table.rowsPerPage'),
                        of: t('table.of'),
                        // search: t('documents.types.search')
                    }}
                    onColumnVisibilityChange={updateColumnVisibility}
                    onDensityChange={updateDensity}
                    onIsFullScreenChange={updateFullScreen}
                    renderTopToolbarCustomActions={() => (
                        <div className='flex items-center gap-3'>
                            <DebouncedInput
                                value={globalFilter ?? ''}
                                onChange={(value) => setGlobalFilter(String(value))}
                                placeholder={t('caseTypes.table.search')}
                            />
                        </div>
                    )}
                />
            </div>
            {/* Delete Confirmation Modal */}
            <DeleteConfModal
                open={deleteModalOpen}
                handleClose={handleCloseDeleteModal}
                title={multiple ? t('caseTypes.deleteConfirmationModal.bulkTitle') : t('caseTypes.deleteConfirmationModal.title')}
                message={multiple ? t('caseTypes.deleteConfirmationModal.bulkMessage') : t('caseTypes.deleteConfirmationModal.message')}
                deleteValue={!multiple ? selectedCaseType?.name : undefined}
                handleDelete={() =>
                    multiple ? handleBulkDelete(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
                }
            />
            {/* Add Case Type Modal */}
            <AddCaseTypeModal
                open={openAddModal}
                handleClose={handleCloseAddModal}
                mode={mode}
                caseTypeData={selectedCaseType}
            />
        </div>
    )
}

export default CaseTypeTable
