'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'
import { Typography, useColorScheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface CaseClientListingProps {
  clientIds: number[]
}

const CaseClientListing: FC<CaseClientListingProps> = ({ clientIds }) => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      if (!clientIds.length) return

      setIsLoading(true)
      try {
        const clientPromises = clientIds.map(id =>
          axiosInstance
            .get(`${API_ROUTES.LAWYER_CLIENTS.getLawyerClients}${id}/`, {
              requiresAuth: true,
              requiredPermission: 'view_lawyerclient'
            } as any)
            .then(res => res.data)
        )
        const clientsData = await Promise.all(clientPromises)
        setClients(clientsData)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [clientIds])

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorFn: row => `${getDisplayValue(row.first_name)} ${getDisplayValue(row.last_name)}`,
        header: t('paymentAuditLogs.clients.table.name'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {cell.getValue<string>()}
          </Typography>
        )
      },
      {
        accessorKey: 'email',
        header: t('paymentAuditLogs.clients.table.email'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'phone_number',
        header: t('paymentAuditLogs.clients.table.phoneNumber'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'client_type',
        header: t('paymentAuditLogs.clients.table.type'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('paymentAuditLogs.clients.table.createdAt'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      }
    ],
    [t]
  )

  return (
    <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
      <MaterialReactTable
        columns={columns}
        data={clients}
        state={{ isLoading }}
        enablePagination={false}
        enableColumnFilters={false}
        enableColumnActions={false}
        enableSorting={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        muiTableBodyRowProps={{ hover: true }}
        localization={{
          noRecordsToDisplay: t('paymentAuditLogs.clients.table.noData')
        }}
      />
    </div>
  )
}

export default CaseClientListing
