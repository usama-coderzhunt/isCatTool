'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'
import { Typography, useColorScheme, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface StaffMember {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  email: string
  phone_number: string
  is_active: boolean
  created_at: string
  updated_at: string
  position: number | null
  user: number | null
}

interface CaseStaffListingProps {
  staffIds: number[]
}

const CaseStaffListing: FC<CaseStaffListingProps> = ({ staffIds }) => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStaffMembers = async () => {
      if (!staffIds.length) return

      setIsLoading(true)
      try {
        const staffPromises = staffIds.map(id =>
          axiosInstance
            .get(`${API_ROUTES.STAFF.getStaff}${id}/`, {
              requiresAuth: true,
              requiredPermission: 'view_staff'
            } as any)
            .then((res: { data: StaffMember }) => res.data)
        )
        const staffData = await Promise.all(staffPromises)
        setStaffMembers(staffData)
      } catch (error) {
        console.error('Error fetching staff members:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaffMembers()
  }, [staffIds])

  const columns = useMemo<MRT_ColumnDef<StaffMember>[]>(
    () => [
      {
        accessorFn: row => `${getDisplayValue(row.first_name)} ${getDisplayValue(row.last_name)}`,
        header: t('paymentAuditLogs.staff.table.name'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {cell.getValue<string>()}
          </Typography>
        )
      },
      {
        accessorKey: 'email',
        header: t('paymentAuditLogs.staff.table.email'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'phone_number',
        header: t('paymentAuditLogs.staff.table.phoneNumber'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'is_active',
        header: t('paymentAuditLogs.staff.table.status'),
        Cell: ({ cell }) => (
          <Chip
            label={
              cell.getValue() ? t('paymentAuditLogs.staff.table.active') : t('paymentAuditLogs.staff.table.inactive')
            }
            color={cell.getValue() ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      },
      {
        accessorKey: 'created_at',
        header: t('paymentAuditLogs.staff.table.createdAt'),
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
        data={staffMembers}
        state={{ isLoading }}
        enablePagination={false}
        enableColumnFilters={false}
        enableColumnActions={false}
        enableSorting={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        muiTableBodyRowProps={{ hover: true }}
        localization={{
          noRecordsToDisplay: t('paymentAuditLogs.staff.table.noData')
        }}
      />
    </div>
  )
}

export default CaseStaffListing
