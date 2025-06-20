'use client'

import { Box, Button, Fade, Typography } from '@mui/material'
import Modal from '@mui/material/Modal'

import { useDocsHooks } from '@/services/useDocsHooks'
import CircularLoader from '@/components/CircularLoader'

const style = {
  position: 'absolute',
  top: '10vh',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '60vw',
  height: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 6,
  borderRadius: '6px'
}

interface ViewDocumentModalProps {
  open: boolean
  handleClose: () => void
  title: string
  docId: number
}

const ViewDocumentModal = ({ open, handleClose, title, docId }: ViewDocumentModalProps) => {
  const { getSingleDocument } = useDocsHooks()
  const { data: singleDocData, isLoading } = getSingleDocument(docId)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
      className='!outline-none'
    >
      <Fade in={open}>
        <Box sx={style}>
          <div className='flex gap-x-2 justify-end items-center mb-4 absolute -top-3 -right-3'>
            <Button
              onClick={handleClose}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-backgroundPaper hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          {isLoading ? (
            <div className='w-full h-full flex items-center justify-center'>
              <CircularLoader />
            </div>
          ) : (
            <div className='flex flex-col gap-y-2 w-full h-full overflow-x-hidden'>
              <div className='flex-1 overflow-hidden border border-solid border-secondary rounded-[6px]'>
                <iframe src={singleDocData?.file} className='w-full h-full overflow-hidden' />
              </div>
            </div>
          )}
        </Box>
      </Fade>
    </Modal>
  )
}

export default ViewDocumentModal
