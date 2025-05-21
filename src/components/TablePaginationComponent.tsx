import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

interface TablePaginationProps {
  totalRecords: number
  currentPage: number
  pageSize: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newPageSize: number) => void
}

const TablePaginationComponent = ({
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}: TablePaginationProps) => {
  const totalPages = Math.ceil(totalRecords / pageSize)

  return (
    <div className='flex justify-between items-center flex-wrap p-4 border-t gap-2'>
      <Typography color='text.secondary'>
        {`Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalRecords)} of ${totalRecords} entries`}
      </Typography>

      {/* Pagination Controls */}
      <div className='flex items-center gap-3'>
        {/* Page Size Selector */}
        <Select value={pageSize} onChange={e => onPageSizeChange(parseInt(e.target.value as string, 10))} size='small'>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>

        {/* Pagination Component */}
        <Pagination
          shape='rounded'
          color='primary'
          variant='outlined'
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => onPageChange(page)}
          showFirstButton
          showLastButton
        />
      </div>
    </div>
  )
}

export default TablePaginationComponent
