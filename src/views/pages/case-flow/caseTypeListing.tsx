'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'
import { Typography, useColorScheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import axiosInstance from '@/utils/api/axiosInstance'

interface CaseType {
  id: number
  name: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

interface CaseTypeListingProps {
  typeIds: number[]
}

const CaseTypeListing: FC<CaseTypeListingProps> = ({ typeIds }) => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCaseTypes = async () => {
      if (!typeIds.length) return

      setIsLoading(true)
      try {
        const typePromises = typeIds.map(id =>
          axiosInstance
            .get(`/api/case-flow/case-types/${id}/`, {
              requiresAuth: true,
              requiredPermission: 'view_casetype'
            } as any)
            .then((res: { data: CaseType }) => res.data)
        )
        const typesData = await Promise.all(typePromises)
        setCaseTypes(typesData)
      } catch (error) {
        console.error('Error fetching case types:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCaseTypes()
  }, [typeIds])

  const columns = useMemo<MRT_ColumnDef<CaseType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('caseTypes.table.name'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('caseTypes.table.createdAt'),
        Cell: ({ cell }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('caseTypes.table.updatedAt'),
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
        data={caseTypes}
        state={{ isLoading }}
        enablePagination={false}
        enableColumnFilters={false}
        enableColumnActions={false}
        enableSorting={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        muiTableBodyRowProps={{ hover: true }}
        localization={{
          noRecordsToDisplay: t('caseTypes.table.noData')
        }}
      />
    </div>
  )
}

export default CaseTypeListing
