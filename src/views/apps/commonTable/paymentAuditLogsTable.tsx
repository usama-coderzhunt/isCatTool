'use client'

import { FC, ReactElement, useEffect, useMemo, useState } from 'react'
import { IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'react-i18next'
import { useTableState } from '@/hooks/useTableState'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { useParams } from 'next/navigation'
import { PaymentAuditLogsTypes } from '@/types/paymentAuditLogTypes'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { exportPaymentAuditLogsToCSV } from './tableExport'

interface PaymentAuditLogsTableProps {
  transactionId: number | undefined
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
      label={t('transactions.table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}

const PaymentAuditLogsTable: FC<PaymentAuditLogsTableProps> = ({ transactionId }): ReactElement => {
  const { t, i18n } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  //States
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getPaymentAuditLogs } = usePaymentsHooks()
  const { data: paymentAuditLogsData, isLoading } = getPaymentAuditLogs(
    Number(transactionId),
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    appliedSearch
  )

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('paymentAuditLogs')

  const columns = useMemo<MRT_ColumnDef<PaymentAuditLogsTypes, any>[]>(() => {
    const allDetailKeys = new Set<string>()
    let hasDetails = false

    paymentAuditLogsData?.data?.results?.forEach((row: PaymentAuditLogsTypes) => {
      if (row.details && Object.keys(row.details).length > 0) {
        hasDetails = true
        Object.keys(row.details).forEach(key => allDetailKeys.add(key))
      }
    })

    const baseColumns: MRT_ColumnDef<PaymentAuditLogsTypes, any>[] = [
      {
        accessorKey: 'action',
        header: t('paymentAuditLogs.table.action'),
        Cell: ({ cell }: { cell: MRT_Cell<PaymentAuditLogsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue() as string)}
          </Typography>
        )
      }
    ]

    // Dynamic columns from details object - only if details exist
    const detailColumns: MRT_ColumnDef<PaymentAuditLogsTypes, any>[] = hasDetails
      ? Array.from(allDetailKeys).map(key => ({
          accessorFn: row => {
            return row.details ? (row.details as Record<string, any>)[key] : undefined
          },
          id: `details.${key}`,
          // header: t(`paymentAuditLogs.table.paymentDetails`, { key }),
          header: `${key}`,
          Cell: ({ cell }: { cell: MRT_Cell<PaymentAuditLogsTypes> }) => (
            <Typography className='font-medium truncate' color='text.primary'>
              {getDisplayValue(cell.getValue() as string)}
            </Typography>
          )
        }))
      : []

    const staticColumns: MRT_ColumnDef<PaymentAuditLogsTypes, any>[] = [
      {
        accessorKey: 'ip_address',
        header: t('paymentAuditLogs.table.ipAddress'),
        Cell: ({ cell }: { cell: MRT_Cell<PaymentAuditLogsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue() as string)}
          </Typography>
        )
      },
      {
        accessorKey: 'user_agent',
        header: t('paymentAuditLogs.table.userAgent'),
        Cell: ({ cell }: { cell: MRT_Cell<PaymentAuditLogsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue() as string)}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('paymentAuditLogs.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<PaymentAuditLogsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime((cell.getValue() as string) ?? '-')}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('paymentAuditLogs.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<PaymentAuditLogsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      }
    ]

    const allColumns = [...baseColumns, ...detailColumns, ...staticColumns]

    return allColumns
  }, [t, paymentAuditLogsData?.data?.results])

  return (
    <div className='w-full flex flex-col gap-y-8'>
      <div className='w-full flex items-center justify-between'>
        <Typography variant='h3'>{t('paymentAuditLogs.table.title')}</Typography>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={paymentAuditLogsData?.data?.results || []}
          manualPagination={true}
          rowCount={paymentAuditLogsData?.data?.count || 0}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={!!paymentAuditLogsData?.data?.results?.length}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          getRowId={row => String(row.id)}
          state={{
            pagination,
            isLoading,
            globalFilter,
            sorting,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            isFullScreen: tableState.isFullScreen
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          onSortingChange={setSorting}
          onPaginationChange={setPagination}
          localization={{
            noRecordsToDisplay: t('paymentAuditLogs.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('paymentAuditLogs.table.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder={t('transactions.table.search')}
              />
              <IconButton
                onClick={() => exportPaymentAuditLogsToCSV(paymentAuditLogsData?.data?.results || [])}
                title={t('table.export')}
              >
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default PaymentAuditLogsTable
