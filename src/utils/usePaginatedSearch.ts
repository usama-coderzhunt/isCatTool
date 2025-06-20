import { useState, useEffect } from 'react'

interface UsePaginatedSearchProps {
  initialPageSize: number
  globalFilter: string
}

export const usePaginatedSearch = ({ initialPageSize, globalFilter }: UsePaginatedSearchProps) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize
  })

  const [appliedSearch, setAppliedSearch] = useState('')

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
    setAppliedSearch(globalFilter)
  }, [globalFilter])

  return {
    pagination,
    setPagination,
    appliedSearch
  }
}
